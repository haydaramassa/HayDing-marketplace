package com.hayding.message.repository;

import com.hayding.message.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    long countByConversationIdAndReadFalseAndSenderIdNot(
            Long conversationId,
            Long senderId
    );

    void deleteByConversationIdIn(List<Long> conversationIds);
}