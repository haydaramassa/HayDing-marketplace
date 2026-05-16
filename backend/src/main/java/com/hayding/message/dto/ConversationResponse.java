package com.hayding.message.dto;

import com.hayding.message.model.Conversation;
import com.hayding.product.dto.ProductResponse;
import com.hayding.user.dto.UserResponse;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long id;
    private ProductResponse product;
    private UserResponse buyer;
    private UserResponse seller;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ConversationResponse() {
    }

    public ConversationResponse(Long id,
                                ProductResponse product,
                                UserResponse buyer,
                                UserResponse seller,
                                LocalDateTime createdAt,
                                LocalDateTime updatedAt) {
        this.id = id;
        this.product = product;
        this.buyer = buyer;
        this.seller = seller;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ConversationResponse fromEntity(Conversation conversation, ProductResponse productResponse) {
        if (conversation == null) {
            return null;
        }

        return new ConversationResponse(
                conversation.getId(),
                productResponse,
                UserResponse.fromEntity(conversation.getBuyer()),
                UserResponse.fromEntity(conversation.getSeller()),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public ProductResponse getProduct() {
        return product;
    }

    public UserResponse getBuyer() {
        return buyer;
    }

    public UserResponse getSeller() {
        return seller;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}