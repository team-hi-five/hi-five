package com.h5.domain.auth.controller;

import com.h5.domain.auth.dto.request.LoginRequestDto;
import com.h5.domain.auth.dto.response.RefreshAccessTokenResponseDto;
import com.h5.domain.auth.service.AuthService;
import com.h5.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@RequestBody LoginRequestDto loginRequestDto) {
        return ApiResponse.success(authService.authenticateAndGenerateToken(loginRequestDto));
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        authService.logout();
        return ApiResponse.success();
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refresh() {
        RefreshAccessTokenResponseDto refreshAccessTokenResponseDto = authService.refreshAccessToken();
        return ApiResponse.success(refreshAccessTokenResponseDto);
    }

    @GetMapping("/get-user-info")
    public ApiResponse<?> getUserInfo() {
        return ApiResponse.success(authService.getUserInfo());
    }

}
