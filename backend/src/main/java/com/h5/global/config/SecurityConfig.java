package com.h5.global.config;

import com.h5.auth.service.ConsultantCustomUserDetailService;
import com.h5.auth.service.ParentCustomUserDetailService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final ConsultantCustomUserDetailService consultantCustomUserDetailService;
    private final ParentCustomUserDetailService parentCustomUserDetailService;

    public SecurityConfig(JwtFilter jwtFilter,
                          ConsultantCustomUserDetailService consultantCustomUserDetailService,
                          ParentCustomUserDetailService parentCustomUserDetailService) {
        this.jwtFilter = jwtFilter;
        this.consultantCustomUserDetailService = consultantCustomUserDetailService;
        this.parentCustomUserDetailService = parentCustomUserDetailService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // CORS 설정
        http.cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.addAllowedOriginPattern("*"); // 허용할 도메인 추가
            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")); // 허용할 HTTP 메서드
            config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
            config.setAllowCredentials(true); // 쿠키 전송 허용
            return config;
        }));

        // 필터 설정 및 경로별 권한 설정
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll() // 로그인 API
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/webjars/**").permitAll()

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);

        DaoAuthenticationProvider consultantProvider = new DaoAuthenticationProvider();
        consultantProvider.setUserDetailsService(consultantCustomUserDetailService);
        consultantProvider.setPasswordEncoder(passwordEncoder);

        DaoAuthenticationProvider parentProvider = new DaoAuthenticationProvider();
        parentProvider.setUserDetailsService(parentCustomUserDetailService);
        parentProvider.setPasswordEncoder(passwordEncoder);

        authBuilder.authenticationProvider(consultantProvider);
        authBuilder.authenticationProvider(parentProvider);

        return authBuilder.build();
    }
}
