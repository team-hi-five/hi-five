package com.h5.auth.service;

import com.h5.auth.dto.request.LoginRequestDto;
import com.h5.auth.dto.response.LoginResponseDto;
import com.h5.auth.dto.response.RefreshAccessTokenResponseDto;
import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.util.JwtUtil;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    private final RedisTemplate<Object, Object> redisTemplate;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ConsultantCustomUserDetailService consultantCustomUserDetailService;
    private final ParentCustomUserDetailService parentCustomUserDetailService;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;

    @Autowired
    public AuthServiceImpl(RedisTemplate<Object, Object> redisTemplate,
                           AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil,
                           ConsultantCustomUserDetailService consultantCustomUserDetailService,
                           ParentCustomUserDetailService parentCustomUserDetailService,
                           ConsultantUserRepository consultantUserRepository,
                           ParentUserRepository parentUserRepository) {
        this.redisTemplate = redisTemplate;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.consultantCustomUserDetailService = consultantCustomUserDetailService;
        this.parentCustomUserDetailService = parentCustomUserDetailService;
        this.consultantUserRepository = consultantUserRepository;
        this.parentUserRepository = parentUserRepository;
    }

    @Override
    public LoginResponseDto authenticateAndGenerateToken(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPwd()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return "ROLE_CONSULTANT".equals(loginRequestDto.getRole()) ?
                processConsultantLogin(loginRequestDto, userDetails) :
                processParentLogin(loginRequestDto, userDetails);
    }

    private LoginResponseDto processConsultantLogin(LoginRequestDto loginRequestDto, UserDetails userDetails) {
        ConsultantUserEntity consultantUser = getConsultantUser(loginRequestDto.getEmail());
        return generateLoginResponse(consultantUser.getName(), userDetails, consultantUser.isTempPwd());
    }

    private LoginResponseDto processParentLogin(LoginRequestDto loginRequestDto, UserDetails userDetails) {
        ParentUserEntity parentUser = getParentUser(loginRequestDto.getEmail());
        return generateLoginResponse(parentUser.getName(), userDetails, parentUser.isTempPwd());
    }

    private ConsultantUserEntity getConsultantUser(String email) {
        return consultantUserRepository.findByEmailAndDeleteDttmIsNull(email)
                .orElseThrow(UserNotFoundException::new);
    }

    private ParentUserEntity getParentUser(String email) {
        return parentUserRepository.findByEmailAndDeleteDttmIsNull(email)
                .orElseThrow(UserNotFoundException::new);
    }

    private LoginResponseDto generateLoginResponse(String name, UserDetails userDetails, boolean isTempPwd) {
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        updateRefreshToken(userDetails.getUsername(), refreshToken);
        return LoginResponseDto.builder()
                .name(name)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .pwdChanged(isTempPwd)
                .build();
    }

    private void updateRefreshToken(String email, String refreshToken) {
        if (consultantUserRepository.existsByEmail(email)) {
            consultantUserRepository.updateRefreshTokenByEmail(email, refreshToken);
        } else if (parentUserRepository.existsByEmail(email)) {
            parentUserRepository.updateRefreshTokenByEmail(email, refreshToken);
        } else {
            throw new IllegalArgumentException("No user found with email: " + email);
        }
    }

    @Override
    public void logout(String token) {
        String jwt = token.replace("Bearer ", "");
        validateToken(jwt);
        String email = jwtUtil.getEmailFromToken(jwt);
        updateRefreshToken(email, null);
        addTokenToBlacklist(jwt);
    }

    private void validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid JWT token");
        }
    }

    private void addTokenToBlacklist(String token) {
        long expiration = jwtUtil.getExpiration(token) - System.currentTimeMillis();
        if (expiration > 0) {
            redisTemplate.opsForValue().set(token, "blacklisted", expiration, TimeUnit.MILLISECONDS);
        }
    }

    @Override
    public RefreshAccessTokenResponseDto refreshAccessToken(String refreshToken) {
        validateToken(refreshToken);

        if (redisTemplate.hasKey(refreshToken) || jwtUtil.isRefreshTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh token is expired or blacklisted. Please login again.");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        UserDetails userDetails = loadUser(email);
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = refreshTokenIfNeeded(refreshToken, userDetails, email);

        return RefreshAccessTokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private String refreshTokenIfNeeded(String refreshToken, UserDetails userDetails, String email) {
        if (jwtUtil.isTokenNearExpiry(refreshToken)) {
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            addTokenToBlacklist(refreshToken);
            updateRefreshToken(email, newRefreshToken);
            return newRefreshToken;
        }
        return refreshToken;
    }

    private UserDetails loadUser(String email) {
        return consultantUserRepository.existsByEmail(email) ?
                consultantCustomUserDetailService.loadUserByUsername(email) :
                parentCustomUserDetailService.loadUserByUsername(email);
    }
}
