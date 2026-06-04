package com.hayding.notification.dto;

import com.hayding.notification.model.Notification;
import com.hayding.notification.model.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;

    private Long actorId;
    private String actorName;

    private Long productId;
    private String productTitle;

    private Long conversationId;
    private String messagePreview;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();

        response.id = notification.getId();
        response.type = notification.getType();
        response.read = notification.isRead();
        response.createdAt = notification.getCreatedAt();

        if (notification.getActor() != null) {
            response.actorId = notification.getActor().getId();
            response.actorName = notification.getActor().getFullName();
        }

        if (notification.getProduct() != null) {
            response.productId = notification.getProduct().getId();
            response.productTitle = notification.getProduct().getTitle();
        }

        if (notification.getConversation() != null) {
            response.conversationId = notification.getConversation().getId();
        }

        if (notification.getMessage() != null) {
            String content = notification.getMessage().getContent();

            if (content != null && content.length() > 80) {
                response.messagePreview = content.substring(0, 77) + "...";
            } else {
                response.messagePreview = content;
            }
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public NotificationType getType() {
        return type;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getActorId() {
        return actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public String getMessagePreview() {
        return messagePreview;
    }
}