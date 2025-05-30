package com.h5.domain.auth.service;

import com.github.hyeonjaez.springcommon.exception.BusinessException;
import com.h5.domain.auth.dto.request.LoginRequestDto;
import com.h5.domain.auth.dto.response.GetUserInfoResponseDto;
import com.h5.domain.auth.dto.response.LoginResponseDto;
import com.h5.domain.auth.dto.response.RefreshAccessTokenResponseDto;
import com.h5.domain.consultant.entity.ConsultantUserEntity;
import com.h5.domain.consultant.repository.ConsultantUserRepository;
import com.h5.domain.parent.entity.ParentUserEntity;
import com.h5.domain.parent.repository.ParentUserRepository;
import com.h5.global.exception.DomainErrorCode;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.redis.RedisService;
import com.h5.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RedisService redisService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ConsultantCustomUserDetailService consultantUserDetails;
    private final ParentCustomUserDetailService parentUserDetails;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;

    @Transactional(readOnly = true)
    public LoginResponseDto authenticateAndGenerateToken(LoginRequestDto dto) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPwd())
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();

        String name;
        boolean isTempPwd;
        if ("ROLE_CONSULTANT".equals(dto.getRole())) {
            ConsultantUserEntity user = consultantUserRepository.findByEmailAndDeleteDttmIsNull(dto.getEmail())
                    .orElseThrow(UserNotFoundException::new);
            name = user.getName();
            isTempPwd = user.isTempPwd();
        } else {
            ParentUserEntity user = parentUserRepository.findByEmailAndDeleteDttmIsNull(dto.getEmail())
                    .orElseThrow(UserNotFoundException::new);
            name = user.getName();
            isTempPwd = user.isTempPwd();
        }

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        redisService.saveRefreshToken(userDetails.getUsername(), refreshToken);

        return LoginResponseDto.builder()
                .name(name)
                .accessToken(accessToken)
                .pwdChanged(isTempPwd)
                .build();
    }

    public void logout() {
        HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new BusinessException(DomainErrorCode.ACCESS_TOKEN_NOTFOUND);
        }

        String accessToken = bearerToken.substring(7);
        long remainingTimeMills = jwtUtil.getRemainExpiredTime(accessToken);
        redisService.saveBlacklistedToken(accessToken, remainingTimeMills);

        String email = jwtUtil.getEmailFromToken(accessToken);
        redisService.deleteRefreshToken(email);
    }

    public RefreshAccessTokenResponseDto refreshAccessToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        String storedToken = redisService.getRefreshToken(email);
        if (storedToken == null || jwtUtil.isRefreshTokenExpired(storedToken)) {
            redisService.deleteRefreshToken(email);
            throw new IllegalArgumentException("Refresh token expired or missing. Please login again.");
        }

        UserDetails userDetails = loadUserByEmail(email);
        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        if (jwtUtil.isTokenNearExpiry(storedToken)) {
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            long oldTtl = jwtUtil.getExpiration(storedToken) - System.currentTimeMillis();
            redisService.saveBlacklistedToken(storedToken, oldTtl);
            redisService.saveRefreshToken(email, newRefreshToken);
        }
        return RefreshAccessTokenResponseDto.builder()
                .accessToken(newAccessToken)
                .build();
    }

    public GetUserInfoResponseDto getUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse(null);

        String name = consultantUserRepository.findByEmail(email)
                .map(ConsultantUserEntity::getName)
                .orElseGet(() -> parentUserRepository.findByEmail(email)
                        .map(ParentUserEntity::getName)
                        .orElseThrow(UserNotFoundException::new));

        return GetUserInfoResponseDto.builder()
                .name(name)
                .role(role)
                .build();
    }

    private UserDetails loadUserByEmail(String email) {
        boolean isConsultant = consultantUserRepository.existsByEmail(email);
        return isConsultant
                ? consultantUserDetails.loadUserByUsername(email)
                : parentUserDetails.loadUserByUsername(email);
    }
}
