package com.hayding.message.repository;

import com.hayding.message.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    @Query("""
            select c.id
            from Conversation c
            where c.buyer.id = :userId
               or c.seller.id = :userId
               or c.product.seller.id = :userId
            """)
    List<Long> findIdsRelatedToUser(Long userId);

    void deleteByIdIn(List<Long> conversationIds);
}