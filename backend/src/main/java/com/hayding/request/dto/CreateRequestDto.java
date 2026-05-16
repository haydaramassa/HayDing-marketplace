package com.hayding.request.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateRequestDto {

    @NotNull
    private Long productId;

    @Size(max = 1000)
    private String message;

    public CreateRequestDto() {
    }

    public Long getProductId() {
        return productId;
    }

    public String getMessage() {
        return message;
    }
}