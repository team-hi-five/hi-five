package com.h5.global.config;

import com.h5.auth.service.ConsultantCustomUserDetailService;
import com.h5.auth.service.ParentCustomUserDetailService;
import com.h5.global.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ConsultantCustomUserDetailService consultantCustomUserDetailService;
    private final ParentCustomUserDetailService parentCustomUserDetailService;
    private final RedisTemplate<Object, Object> redisTemplate;

    // Swagger 경로를 제외할 리스트
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/api/swagger-ui/",
            "/api/v3/api-docs",
            "/api/swagger-resources",
            "/api/webjars"
    );

    @Autowired
    public JwtFilter(JwtUtil jwtUtil,
                     ConsultantCustomUserDetailService consultantCustomUserDetailService,
                     ParentCustomUserDetailService parentCustomUserDetailService,
                     RedisTemplate<Object, Object> redisTemplate) {
        this.jwtUtil = jwtUtil;
        this.consultantCustomUserDetailService = consultantCustomUserDetailService;
        this.parentCustomUserDetailService = parentCustomUserDetailService;
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Swagger 경로 요청 필터 제외
        if (EXCLUDED_PATHS.stream().anyMatch(requestURI::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;
        String role = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            // Redis에 토큰 존재 여부 확인
            if (Boolean.TRUE.equals(redisTemplate.hasKey(token))) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }

            if (requestURI.equals("/auth/refresh")) {
                email = jwtUtil.getEmailFromExpiredToken(token);
                role = jwtUtil.getRoleFromExpiredToken(token);

                setSecurityContext(email, role);
            } else {
                // 일반 요청에서는 유효한 JWT인지 검사
                if (!jwtUtil.validateToken(token)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid JWT token");
                    return;
                }
                email = jwtUtil.getEmailFromToken(token);
                role = jwtUtil.getRoleFromToken(token);
            }
        }

        // 인증 정보 설정
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            setSecurityContext(email, role);
        }

        filterChain.doFilter(request, response);
    }

    private void setSecurityContext(String email, String role) {
        UserDetails userDetails;
        if ("ROLE_CONSULTANT".equals(role)) {
            userDetails = consultantCustomUserDetailService.loadUserByUsername(email);
        } else {
            userDetails = parentCustomUserDetailService.loadUserByUsername(email);
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
