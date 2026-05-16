package com.hayding.product.dto;

import com.hayding.product.model.ProductImage;

import java.time.LocalDateTime;

public class ProductImageResponse {

    private Long id;
    private String imageUrl;
    private boolean mainImage;
    private int sortOrder;
    private LocalDateTime createdAt;

    public ProductImageResponse() {
    }

    public ProductImageResponse(Long id,
                                String imageUrl,
                                boolean mainImage,
                                int sortOrder,
                                LocalDateTime createdAt) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.mainImage = mainImage;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
    }

    public static ProductImageResponse fromEntity(ProductImage image) {
        if (image == null) {
            return null;
        }

        return new ProductImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.isMainImage(),
                image.getSortOrder(),
                image.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isMainImage() {
        return mainImage;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}