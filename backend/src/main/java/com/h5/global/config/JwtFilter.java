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

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ConsultantCustomUserDetailService consultantCustomUserDetailService;
    private final ParentCustomUserDetailService parentCustomUserDetailService;
    private final RedisTemplate<Object, Object> redisTemplate;

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
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;
        String role = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            if (redisTemplate.hasKey(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid token");
                return;
            }

            if (jwtUtil.validateToken(token)) {
                email = jwtUtil.getEmailFromToken(token);
                role = jwtUtil.getRoleFromToken(token);
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            if (role.equals("CONSULTANT")) {
                userDetails = consultantCustomUserDetailService.loadUserByUsername(email);
            } else {
                userDetails = parentCustomUserDetailService.loadUserByUsername(email);
            }

            if (jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
