package com.hayding.auth.controller;

import com.hayding.auth.dto.AuthResponse;
import com.hayding.auth.dto.LoginRequest;
import com.hayding.auth.dto.RegisterRequest;
import com.hayding.auth.service.AuthService;
import com.hayding.common.dto.ApiResponse;
import com.hayding.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ApiResponse.success("User registered successfully", user);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ApiResponse.success("Login successful", authResponse);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse user = authService.getCurrentUser(authentication.getName());
        return ApiResponse.success("Current user fetched successfully", user);
    }
}