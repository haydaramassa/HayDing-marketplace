package com.hayding.message.dto;

import jakarta.validation.constraints.NotNull;

public class CreateConversationRequest {

    @NotNull
    private Long productId;

    public CreateConversationRequest() {
    }

    public Long getProductId() {
        return productId;
    }
}