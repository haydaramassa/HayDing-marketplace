package com.hayding.product.model;

import com.hayding.category.model.Category;
import com.hayding.common.enums.ProductCondition;
import com.hayding.common.enums.ProductStatus;
import com.hayding.user.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String city;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", nullable = false, length = 40)
    private ProductCondition conditionStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_status", nullable = false, length = 40)
    private ProductStatus productStatus = ProductStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;

    @Column(name = "boost_score", nullable = false)
    private int boostScore = 0;

    @Column(name = "boosted_until")
    private LocalDateTime boostedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Product() {
    }

    public Product(String title,
                   String description,
                   BigDecimal price,
                   String city,
                   ProductCondition conditionStatus,
                   User seller,
                   Category category) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.city = city;
        this.conditionStatus = conditionStatus;
        this.seller = seller;
        this.category = category;
        this.productStatus = ProductStatus.ACTIVE;
        this.featured = false;
        this.boostScore = 0;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.productStatus == null) {
            this.productStatus = ProductStatus.ACTIVE;
        }

        this.featured = false;
        this.boostScore = Math.max(this.boostScore, 0);
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.productStatus == null) {
            this.productStatus = ProductStatus.ACTIVE;
        }

        this.boostScore = Math.max(this.boostScore, 0);
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public ProductCondition getConditionStatus() {
        return conditionStatus;
    }

    public void setConditionStatus(ProductCondition conditionStatus) {
        this.conditionStatus = conditionStatus;
    }

    public ProductStatus getProductStatus() {
        return productStatus;
    }

    public void setProductStatus(ProductStatus productStatus) {
        this.productStatus = productStatus;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public LocalDateTime getFeaturedUntil() {
        return featuredUntil;
    }

    public void setFeaturedUntil(LocalDateTime featuredUntil) {
        this.featuredUntil = featuredUntil;
    }

    public int getBoostScore() {
        return boostScore;
    }

    public void setBoostScore(int boostScore) {
        this.boostScore = boostScore;
    }

    public LocalDateTime getBoostedUntil() {
        return boostedUntil;
    }

    public void setBoostedUntil(LocalDateTime boostedUntil) {
        this.boostedUntil = boostedUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}