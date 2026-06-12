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
            select c
            from Conversation c
            left join Message m on m.conversation = c
            where c.buyer.id = :userId
               or c.seller.id = :userId
            group by c
            order by coalesce(max(m.createdAt), c.updatedAt) desc
            """)
    List<Conversation> findMyConversationsOrderByLastActivity(Long userId);

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