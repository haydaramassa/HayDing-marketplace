package com.hayding.product.dto;

import com.hayding.common.enums.ProductCondition;
import com.hayding.common.enums.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductUpdateRequest {

    @Size(max = 160)
    private String title;

    private String description;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @Size(max = 120)
    private String city;

    private ProductCondition conditionStatus;

    private ProductStatus productStatus;

    private Long categoryId;

    private List<String> imageUrls;

    public ProductUpdateRequest() {
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

    public Long getCategoryId() {
        return categoryId;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }
}