package com.hayding.product.repository;

import com.hayding.product.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId);

    Optional<ProductImage> findByProductIdAndMainImageTrue(Long productId);

    void deleteByProductId(Long productId);

    void deleteByProductIdIn(List<Long> productIds);
}