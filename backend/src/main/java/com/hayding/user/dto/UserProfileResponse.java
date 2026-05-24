package com.hayding.user.dto;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String city,
        String preferredLanguage
) {
}