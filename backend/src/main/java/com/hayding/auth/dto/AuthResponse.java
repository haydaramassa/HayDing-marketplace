package com.hayding.auth.dto;

import com.hayding.user.dto.UserResponse;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
        this.tokenType = "Bearer";
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public UserResponse getUser() {
        return user;
    }
}