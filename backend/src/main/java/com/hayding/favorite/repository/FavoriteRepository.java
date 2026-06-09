package com.hayding.favorite.repository;

import com.hayding.favorite.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Favorite> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);

    void deleteByProductIdIn(List<Long> productIds);


    @Query("""
            select f.product.id, count(f.id)
            from Favorite f
            where f.product.seller.id = :sellerId
            group by f.product.id
            """)
    List<Object[]> countFavoritesForSellerProducts(@Param("sellerId") Long sellerId);
}