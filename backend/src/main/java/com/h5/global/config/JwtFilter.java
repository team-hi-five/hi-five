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
            "/swagger-ui/",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars"
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

            // JWT 유효성 검증
            if (!jwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid JWT token");
                return;
            }

            // 토큰에서 이메일과 역할 추출
            email = jwtUtil.getEmailFromToken(token);
            role = jwtUtil.getRoleFromToken(token);
        }

        // 인증 정보 설정
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails;
            if ("ROLE_CONSULTANT".equals(role)) {
                userDetails = consultantCustomUserDetailService.loadUserByUsername(email);
            } else {
                userDetails = parentCustomUserDetailService.loadUserByUsername(email);
            }

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(email, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
