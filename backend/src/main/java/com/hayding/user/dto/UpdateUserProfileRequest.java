package com.hayding.user.dto;

public record UpdateUserProfileRequest(
        String fullName,
        String city,
        String bio,
        String preferredLanguage
) {
}