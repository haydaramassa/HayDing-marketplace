package com.hayding.product.dto;

import com.hayding.category.dto.CategoryResponse;
import com.hayding.common.enums.ProductCondition;
import com.hayding.common.enums.ProductStatus;
import com.hayding.product.model.Product;
import com.hayding.user.dto.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String city;
    private ProductCondition conditionStatus;
    private ProductStatus productStatus;
    private UserResponse seller;
    private CategoryResponse category;
    private List<ProductImageResponse> images;

    private boolean featured;
    private LocalDateTime featuredUntil;
    private int boostScore;
    private LocalDateTime boostedUntil;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {
    }

    public ProductResponse(Long id,
                           String title,
                           String description,
                           BigDecimal price,
                           String city,
                           ProductCondition conditionStatus,
                           ProductStatus productStatus,
                           UserResponse seller,
                           CategoryResponse category,
                           List<ProductImageResponse> images,
                           boolean featured,
                           LocalDateTime featuredUntil,
                           int boostScore,
                           LocalDateTime boostedUntil,
                           LocalDateTime createdAt,
                           LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.city = city;
        this.conditionStatus = conditionStatus;
        this.productStatus = productStatus;
        this.seller = seller;
        this.category = category;
        this.images = images;
        this.featured = featured;
        this.featuredUntil = featuredUntil;
        this.boostScore = boostScore;
        this.boostedUntil = boostedUntil;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProductResponse fromEntity(Product product, List<ProductImageResponse> images) {
        if (product == null) {
            return null;
        }

        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCity(),
                product.getConditionStatus(),
                product.getProductStatus(),
                UserResponse.fromEntity(product.getSeller()),
                CategoryResponse.fromEntity(product.getCategory()),
                images,
                product.isFeatured(),
                product.getFeaturedUntil(),
                product.getBoostScore(),
                product.getBoostedUntil(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCity() {
        return city;
    }

    public ProductCondition getConditionStatus() {
        return conditionStatus;
    }

    public ProductStatus getProductStatus() {
        return productStatus;
    }

    public UserResponse getSeller() {
        return seller;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public List<ProductImageResponse> getImages() {
        return images;
    }

    public boolean isFeatured() {
        return featured;
    }

    public LocalDateTime getFeaturedUntil() {
        return featuredUntil;
    }

    public int getBoostScore() {
        return boostScore;
    }

    public LocalDateTime getBoostedUntil() {
        return boostedUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}