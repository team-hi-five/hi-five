package com.h5.global.config;

import com.h5.auth.service.ConsultantCustomUserDetailService;
import com.h5.auth.service.ParentCustomUserDetailService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
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
                        // 인증 정보가 없어도 가능
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/user/consultant/find-id", "/user/consultant/temp-pwd").permitAll()
                        .requestMatchers("/user/parent/find-id", "/user/parent/temp-pwd").permitAll()

                        // 상담사만 가능
                        .requestMatchers("/user/consultant/change-pwd", "/user/consultant/get-child",
                                "/user/consultant/email-check","/user/consultant/search-child/",
                                "/user/consultant/get-my-children", "/user/consultant/modify-child",
                                "/user/consultant/register-parent-account", "/user/consultant/my-profile").hasRole("ROLE_CONSULTANT")
                        .requestMatchers("/user/delete/approve", "/user/delete/reject", "/user/delete/get-my-delete").hasRole("ROLE_CONSULTANT")
                        .requestMatchers("/faq/write", "/faq/delete/", "/faq/update").hasRole("ROLE_CONSULTANT")
                        .requestMatchers("/notice/write","/notice/delete/","/notice/update").hasRole("ROLE_CONSULTANT")
                        .requestMatchers("/qna/write-qna-comment","/qna/update-comment","/qna/delete-comment/").hasRole("ROLE_CONSULTANT")
                        .requestMatchers("/schedule/create","/schedule/update","/schedule/delete/",
                                "/schedule/list-by-date","/schedule/available-times").hasRole("ROLE_CONSULTANT")

                        // 학부모만 가능
                        .requestMatchers("/user/parent/change-pwd","/user/parent/my-page",
                                "/user/parent/my-children").hasRole("ROLE_PARENT")
                        .requestMatchers("/qna/write","/qna/update").hasRole("ROLE_PARENT")
                        .requestMatchers("/chatbot/insert-chatbot").hasRole("ROLE_PARENT")
                        .requestMatchers("/user/delete/request").hasRole("ROLE_PARENT")
                        .requestMatchers("/game/start-game-chapter","/game/start-game-stage",
                                "/game/end-game-chapter","/game/save-log").hasRole("ROLE_PARENT")
                        .requestMatchers("study/start-study-chapter","/study/start-study-stage",
                                "/study/end-study-chapter","/study/save-log").hasRole("ROLE_PARENT")
                        .requestMatchers("/schedule/list-by-parent","/schedule/dates-by-parent").hasRole("ROLE_PARENT")

                        // 인증된 사용자 전부 가능
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            ConsultantCustomUserDetailService consultantCustomUserDetailService,
            ParentCustomUserDetailService parentCustomUserDetailService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider consultantProvider = new DaoAuthenticationProvider();
        consultantProvider.setUserDetailsService(consultantCustomUserDetailService);
        consultantProvider.setPasswordEncoder(passwordEncoder);
        consultantProvider.setHideUserNotFoundExceptions(false);  // 추가

        DaoAuthenticationProvider parentProvider = new DaoAuthenticationProvider();
        parentProvider.setUserDetailsService(parentCustomUserDetailService);
        parentProvider.setPasswordEncoder(passwordEncoder);
        parentProvider.setHideUserNotFoundExceptions(false);  // 추가

        return new ProviderManager(List.of(consultantProvider, parentProvider));
    }

}
