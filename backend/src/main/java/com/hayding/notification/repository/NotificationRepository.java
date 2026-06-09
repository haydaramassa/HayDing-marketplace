package com.hayding.notification.repository;

import com.hayding.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    int countByRecipientIdAndReadAtIsNull(Long recipientId);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    @Modifying
    @Query("""
            update Notification n
            set n.readAt = :readAt
            where n.recipient.id = :recipientId
              and n.readAt is null
            """)
    void markAllAsRead(@Param("recipientId") Long recipientId,
                       @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("""
            update Notification n
            set n.readAt = :readAt
            where n.recipient.id = :recipientId
              and n.conversation.id = :conversationId
              and n.readAt is null
            """)
    void markConversationNotificationsAsRead(@Param("recipientId") Long recipientId,
                                             @Param("conversationId") Long conversationId,
                                             @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("""
            update Notification n
            set n.readAt = :readAt
            where n.id = :notificationId
              and n.recipient.id = :recipientId
              and n.readAt is null
            """)
    void markOneAsRead(@Param("notificationId") Long notificationId,
                       @Param("recipientId") Long recipientId,
                       @Param("readAt") LocalDateTime readAt);

    void deleteByRecipientIdOrActorId(Long recipientId, Long actorId);

    void deleteByProductIdIn(List<Long> productIds);

    void deleteByConversationIdIn(List<Long> conversationIds);
}

