package com.hayding.auth.controller;

import com.hayding.auth.dto.RegisterRequest;
import com.hayding.auth.service.AuthService;
import com.hayding.common.dto.ApiResponse;
import com.hayding.user.dto.UserResponse;
import jakarta.validation.Valid;
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
}