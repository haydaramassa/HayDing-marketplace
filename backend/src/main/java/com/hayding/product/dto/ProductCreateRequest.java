package com.hayding.product.dto;

import com.hayding.common.enums.ProductCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductCreateRequest {

    @NotBlank
    @Size(max = 160)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @NotBlank
    @Size(max = 120)
    private String city;

    @NotNull
    private ProductCondition conditionStatus;

    @NotNull
    private Long categoryId;

    private List<String> imageUrls;

    public ProductCreateRequest() {
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

    public Long getCategoryId() {
        return categoryId;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }
}