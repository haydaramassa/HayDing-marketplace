package com.hayding.message.repository;

import com.hayding.message.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByProductIdAndBuyerIdAndSellerId(
            Long productId,
            Long buyerId,
            Long sellerId
    );

    List<Conversation> findByBuyerIdOrSellerIdOrderByUpdatedAtDesc(
            Long buyerId,
            Long sellerId
    );
}