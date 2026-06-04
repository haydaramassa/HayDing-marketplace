package com.hayding.notification.service;

import com.hayding.message.model.Conversation;
import com.hayding.message.model.Message;
import com.hayding.notification.dto.NotificationResponse;
import com.hayding.notification.model.Notification;
import com.hayding.notification.model.NotificationType;
import com.hayding.notification.repository.NotificationRepository;
import com.hayding.product.model.Product;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createMessageNotification(Conversation conversation, Message message) {
        User sender = message.getSender();
        User recipient = getOtherParticipant(conversation, sender);

        if (recipient.getId().equals(sender.getId())) {
            return;
        }

        Notification notification = new Notification(
                NotificationType.MESSAGE,
                recipient,
                sender,
                conversation.getProduct(),
                conversation,
                message
        );

        notificationRepository.save(notification);
    }

    @Transactional
    public void createFavoriteNotification(User actor, Product product) {
        User recipient = product.getSeller();

        if (recipient.getId().equals(actor.getId())) {
            return;
        }

        Notification notification = new Notification(
                NotificationType.FAVORITE,
                recipient,
                actor,
                product,
                null,
                null
        );

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public int getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);

        return notificationRepository.countByRecipientIdAndReadAtIsNull(user.getId());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String userEmail) {
        User user = getUserByEmail(userEmail);

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);

        notificationRepository.markAllAsRead(user.getId(), LocalDateTime.now());
    }

    @Transactional
    public void markConversationNotificationsAsRead(Long conversationId, User user) {
        notificationRepository.markConversationNotificationsAsRead(
                user.getId(),
                conversationId,
                LocalDateTime.now()
        );
    }

    @Transactional
    public void markConversationNotificationsAsRead(Long conversationId, String userEmail) {
        User user = getUserByEmail(userEmail);

        markConversationNotificationsAsRead(conversationId, user);
    }

    private User getOtherParticipant(Conversation conversation, User sender) {
        if (conversation.getBuyer().getId().equals(sender.getId())) {
            return conversation.getSeller();
        }

        return conversation.getBuyer();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public void markOneAsRead(Long notificationId, String userEmail) {
        User user = getUserByEmail(userEmail);

        notificationRepository.markOneAsRead(
                notificationId,
                user.getId(),
                LocalDateTime.now()
        );
    }
}