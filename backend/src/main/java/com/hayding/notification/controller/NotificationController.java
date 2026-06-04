package com.hayding.notification.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.notification.dto.NotificationResponse;
import com.hayding.notification.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        List<NotificationResponse> notifications =
                notificationService.getMyNotifications(authentication.getName());

        return ApiResponse.success("Notifications fetched successfully", notifications);
    }

    @GetMapping("/unread-count")
    public ApiResponse<Integer> getUnreadCount(Authentication authentication) {
        int unreadCount = notificationService.getUnreadCount(authentication.getName());

        return ApiResponse.success("Unread notification count fetched successfully", unreadCount);
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());

        return ApiResponse.success("Notifications marked as read successfully", null);
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ApiResponse<Void> markConversationNotificationsAsRead(@PathVariable Long conversationId,
                                                                 Authentication authentication) {
        notificationService.markConversationNotificationsAsRead(
                conversationId,
                authentication.getName()
        );

        return ApiResponse.success("Conversation notifications marked as read successfully", null);
    }
}