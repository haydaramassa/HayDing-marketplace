package com.hayding.request.repository;

import com.hayding.common.enums.RequestStatus;
import com.hayding.request.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Request> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Request> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Request> findByStatus(RequestStatus status);

    Optional<Request> findByBuyerIdAndProductId(Long buyerId, Long productId);

    boolean existsByBuyerIdAndProductId(Long buyerId, Long productId);
}