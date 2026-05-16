package com.hayding.request.dto;

import com.hayding.common.enums.PaymentProvider;
import com.hayding.common.enums.PaymentStatus;
import com.hayding.common.enums.RequestStatus;
import com.hayding.product.dto.ProductResponse;
import com.hayding.request.model.Request;
import com.hayding.user.dto.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RequestResponse {

    private Long id;
    private UserResponse buyer;
    private UserResponse seller;
    private ProductResponse product;
    private RequestStatus status;
    private String message;

    private BigDecimal productPrice;
    private BigDecimal platformFee;
    private BigDecimal buyerProtectionFee;
    private BigDecimal sellerAmount;
    private PaymentStatus paymentStatus;
    private PaymentProvider paymentProvider;
    private boolean buyerProtectionEnabled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RequestResponse() {
    }

    public RequestResponse(Long id,
                           UserResponse buyer,
                           UserResponse seller,
                           ProductResponse product,
                           RequestStatus status,
                           String message,
                           BigDecimal productPrice,
                           BigDecimal platformFee,
                           BigDecimal buyerProtectionFee,
                           BigDecimal sellerAmount,
                           PaymentStatus paymentStatus,
                           PaymentProvider paymentProvider,
                           boolean buyerProtectionEnabled,
                           LocalDateTime createdAt,
                           LocalDateTime updatedAt) {
        this.id = id;
        this.buyer = buyer;
        this.seller = seller;
        this.product = product;
        this.status = status;
        this.message = message;
        this.productPrice = productPrice;
        this.platformFee = platformFee;
        this.buyerProtectionFee = buyerProtectionFee;
        this.sellerAmount = sellerAmount;
        this.paymentStatus = paymentStatus;
        this.paymentProvider = paymentProvider;
        this.buyerProtectionEnabled = buyerProtectionEnabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RequestResponse fromEntity(Request request, ProductResponse productResponse) {
        if (request == null) {
            return null;
        }

        return new RequestResponse(
                request.getId(),
                UserResponse.fromEntity(request.getBuyer()),
                UserResponse.fromEntity(request.getSeller()),
                productResponse,
                request.getStatus(),
                request.getMessage(),
                request.getProductPrice(),
                request.getPlatformFee(),
                request.getBuyerProtectionFee(),
                request.getSellerAmount(),
                request.getPaymentStatus(),
                request.getPaymentProvider(),
                request.isBuyerProtectionEnabled(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public UserResponse getBuyer() {
        return buyer;
    }

    public UserResponse getSeller() {
        return seller;
    }

    public ProductResponse getProduct() {
        return product;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public BigDecimal getBuyerProtectionFee() {
        return buyerProtectionFee;
    }

    public BigDecimal getSellerAmount() {
        return sellerAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public PaymentProvider getPaymentProvider() {
        return paymentProvider;
    }

    public boolean isBuyerProtectionEnabled() {
        return buyerProtectionEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}