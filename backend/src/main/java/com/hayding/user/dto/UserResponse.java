package com.hayding.user.dto;

import com.hayding.common.enums.UserRole;
import com.hayding.user.model.User;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String city;
    private String preferredLanguage;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id,
                        String fullName,
                        String email,
                        String city,
                        String preferredLanguage,
                        UserRole role,
                        boolean enabled,
                        LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.city = city;
        this.preferredLanguage = preferredLanguage;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCity(),
                user.getPreferredLanguage(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getCity() {
        return city;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}