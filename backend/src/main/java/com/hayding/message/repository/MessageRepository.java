package com.hayding.message.repository;

import com.hayding.message.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    long countByConversationIdAndReadFalseAndSenderIdNot(
            Long conversationId,
            Long senderId
    );

    @Modifying
    @Query("""
            update Message m
            set m.read = true
            where m.conversation.id = :conversationId
              and m.sender.id <> :userId
              and m.read = false
            """)
    int markIncomingMessagesAsRead(Long conversationId, Long userId);

    void deleteByConversationIdIn(List<Long> conversationIds);
}