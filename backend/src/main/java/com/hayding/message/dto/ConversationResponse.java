package com.hayding.message.dto;

import com.hayding.message.model.Conversation;
import com.hayding.message.model.Message;
import com.hayding.product.dto.ProductResponse;
import com.hayding.user.dto.UserResponse;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long id;
    private ProductResponse product;
    private UserResponse buyer;
    private UserResponse seller;
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ConversationResponse() {
    }

    public ConversationResponse(Long id,
                                ProductResponse product,
                                UserResponse buyer,
                                UserResponse seller,
                                String lastMessageContent,
                                LocalDateTime lastMessageAt,
                                long unreadCount,
                                LocalDateTime createdAt,
                                LocalDateTime updatedAt) {
        this.id = id;
        this.product = product;
        this.buyer = buyer;
        this.seller = seller;
        this.lastMessageContent = lastMessageContent;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ConversationResponse fromEntity(Conversation conversation,
                                                  ProductResponse productResponse) {
        return fromEntity(conversation, productResponse, null, 0);
    }

    public static ConversationResponse fromEntity(Conversation conversation,
                                                  ProductResponse productResponse,
                                                  Message lastMessage,
                                                  long unreadCount) {
        if (conversation == null) {
            return null;
        }

        return new ConversationResponse(
                conversation.getId(),
                productResponse,
                UserResponse.fromEntity(conversation.getBuyer()),
                UserResponse.fromEntity(conversation.getSeller()),
                lastMessage != null ? lastMessage.getContent() : null,
                lastMessage != null ? lastMessage.getCreatedAt() : null,
                unreadCount,
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

    public String getLastMessageContent() {
        return lastMessageContent;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}