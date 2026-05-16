package com.hayding.message.dto;

import com.hayding.message.model.Message;
import com.hayding.user.dto.UserResponse;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private Long conversationId;
    private UserResponse sender;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;

    public MessageResponse() {
    }

    public MessageResponse(Long id,
                           Long conversationId,
                           UserResponse sender,
                           String content,
                           boolean read,
                           LocalDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static MessageResponse fromEntity(Message message) {
        if (message == null) {
            return null;
        }

        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                UserResponse.fromEntity(message.getSender()),
                message.getContent(),
                message.isRead(),
                message.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public UserResponse getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}