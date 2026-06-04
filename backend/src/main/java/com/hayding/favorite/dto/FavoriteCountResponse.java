package com.hayding.favorite.dto;

public class FavoriteCountResponse {

    private Long productId;
    private Long favoriteCount;

    public FavoriteCountResponse(Long productId, Long favoriteCount) {
        this.productId = productId;
        this.favoriteCount = favoriteCount;
    }

    public Long getProductId() {
        return productId;
    }

    public Long getFavoriteCount() {
        return favoriteCount;
    }
}