package com.hayding.favorite.dto;

import com.hayding.favorite.model.Favorite;

import java.time.LocalDateTime;

public class FavoriteUserResponse {

    private Long userId;
    private String fullName;
    private String city;
    private String profileImageUrl;
    private LocalDateTime favoritedAt;

    public FavoriteUserResponse(Long userId,
                                String fullName,
                                String city,
                                String profileImageUrl,
                                LocalDateTime favoritedAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.city = city;
        this.profileImageUrl = profileImageUrl;
        this.favoritedAt = favoritedAt;
    }

    public static FavoriteUserResponse fromEntity(Favorite favorite) {
        return new FavoriteUserResponse(
                favorite.getUser().getId(),
                favorite.getUser().getFullName(),
                favorite.getUser().getCity(),
                favorite.getUser().getProfileImageUrl(),
                favorite.getCreatedAt()
        );
    }

    public Long getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getCity() {
        return city;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public LocalDateTime getFavoritedAt() {
        return favoritedAt;
    }
}