package com.hayding.user.dto;

import com.hayding.user.model.User;

import java.time.LocalDateTime;

public record PublicUserProfileResponse(
        Long id,
        String fullName,
        String city,
        String bio,
        String preferredLanguage,
        LocalDateTime createdAt
) {
    public static PublicUserProfileResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return new PublicUserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getCity(),
                user.getBio(),
                user.getPreferredLanguage(),
                user.getCreatedAt()
        );
    }
}