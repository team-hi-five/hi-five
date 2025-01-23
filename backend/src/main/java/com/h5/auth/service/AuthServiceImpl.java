package com.h5.auth.service;

import com.h5.auth.dto.request.LoginRequestDto;
import com.h5.auth.dto.response.LoginResponseDto;
import com.h5.auth.dto.response.RefreshAccessTokenResponseDto;
import com.h5.auth.model.ConsultantCustomUserDetails;
import com.h5.auth.model.ParentCustomUserDetails;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.util.JwtUtil;
import com.h5.parent.repository.ParentUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        authenticateUser(loginRequestDto.getEmail(), loginRequestDto.getPwd());
        return generateLoginResponse(loginRequestDto.getEmail(), loginRequestDto.getRole());
    }

    private void authenticateUser(String email, String password) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(email, password);
        authenticationManager.authenticate(token);
    }

    private LoginResponseDto generateLoginResponse(String email, String role) {
        UserDetails userDetails = loadUserByRole(email, role);
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        updateRefreshTokenInRepository(email, refreshToken, role);
        boolean pwdChanged = isTemporaryPassword(userDetails, role);

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .pwdChanged(pwdChanged)
                .build();
    }

    private UserDetails loadUserByRole(String email, String role) {
        if ("ROLE_CONSULTANT".equals(role)) {
            return consultantCustomUserDetailService.loadUserByUsername(email);
        } else {
            return parentCustomUserDetailService.loadUserByUsername(email);
        }
    }

    private void updateRefreshTokenInRepository(String email, String refreshToken, String role) {
        int result;
        if ("ROLE_CONSULTANT".equals(role)) {
            result = consultantUserRepository.updateRefreshTokenByEmail(email, refreshToken);
        } else {
            result = parentUserRepository.updateRefreshTokenByEmail(email, refreshToken);
        }
        if (result == 0) {
            throw new IllegalArgumentException("No user found with email " + email);
        }
    }

    private boolean isTemporaryPassword(UserDetails userDetails, String role) {
        if ("ROLE_CONSULTANT".equals(role)) {
            return ((ConsultantCustomUserDetails) userDetails).getIsTempPwd();
        } else {
            return ((ParentCustomUserDetails) userDetails).getIsTempPwd();
        }
    }

    @Override
    public void logout(String token) {
        String jwt = token.replace("Bearer ", "");
        validateToken(jwt);

        String email = jwtUtil.getEmailFromToken(jwt);
        String role = jwtUtil.getRoleFromToken(jwt);

        updateRefreshTokenInRepository(email, null, role);
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

    private void isRefreshTokenExpired(String token) {
        if (jwtUtil.isRefreshTokenExpired(token)) {
            throw new IllegalArgumentException("Refresh token is expired. Please login again");
        }
    }

    @Override
    public RefreshAccessTokenResponseDto refreshAccessToken(String refreshToken) {
        validateToken(refreshToken);
        isRefreshTokenExpired(refreshToken);

        if (jwtUtil.isRefreshTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh token is expired. Please login again");
        }

        if (redisTemplate.hasKey(refreshToken)) {
            throw new IllegalArgumentException("Refresh token is blacklisted");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        String role = jwtUtil.getRoleFromToken(refreshToken);
        UserDetails userDetails = loadUserByRole(email, role);

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = refreshTokenIfNeeded(refreshToken, userDetails, email, role);

        return RefreshAccessTokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken != null ? newRefreshToken : refreshToken)
                .build();
    }

    private String refreshTokenIfNeeded(String refreshToken, UserDetails userDetails, String email, String role) {
        if (jwtUtil.isTokenNearExpiry(refreshToken)) {
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            addTokenToBlacklist(refreshToken);
            updateRefreshTokenInRepository(email, newRefreshToken, role);
            return newRefreshToken;
        }
        return null;
    }
}
