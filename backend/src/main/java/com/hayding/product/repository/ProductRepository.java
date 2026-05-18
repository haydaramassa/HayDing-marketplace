package com.hayding.product.repository;

import com.hayding.common.enums.ProductStatus;
import com.hayding.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByProductStatus(ProductStatus productStatus);

    List<Product> findBySellerId(Long sellerId);

    List<Product> findBySellerIdAndProductStatusNot(Long sellerId, ProductStatus productStatus);

    List<Product> findByCategoryIdAndProductStatus(Long categoryId, ProductStatus productStatus);

    List<Product> findByCityIgnoreCaseAndProductStatus(String city, ProductStatus productStatus);
}