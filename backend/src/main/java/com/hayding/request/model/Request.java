package com.hayding.request.model;

import com.hayding.common.enums.PaymentProvider;
import com.hayding.common.enums.PaymentStatus;
import com.hayding.common.enums.RequestStatus;
import com.hayding.product.model.Product;
import com.hayding.user.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "product_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal productPrice;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "platform_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "buyer_protection_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal buyerProtectionFee = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "seller_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellerAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 40)
    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_provider", nullable = false, length = 40)
    private PaymentProvider paymentProvider = PaymentProvider.NONE;

    @Column(name = "buyer_protection_enabled", nullable = false)
    private boolean buyerProtectionEnabled = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Request() {
    }

    public Request(User buyer, User seller, Product product, String message) {
        this.buyer = buyer;
        this.seller = seller;
        this.product = product;
        this.message = message;

        if (product != null) {
            this.productPrice = product.getPrice();
            this.sellerAmount = product.getPrice();
        }

        this.status = RequestStatus.PENDING;
        this.paymentStatus = PaymentStatus.NOT_REQUIRED;
        this.paymentProvider = PaymentProvider.NONE;
        this.platformFee = BigDecimal.ZERO;
        this.buyerProtectionFee = BigDecimal.ZERO;
        this.buyerProtectionEnabled = false;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = RequestStatus.PENDING;
        }

        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.NOT_REQUIRED;
        }

        if (this.paymentProvider == null) {
            this.paymentProvider = PaymentProvider.NONE;
        }

        if (this.platformFee == null) {
            this.platformFee = BigDecimal.ZERO;
        }

        if (this.buyerProtectionFee == null) {
            this.buyerProtectionFee = BigDecimal.ZERO;
        }

        if (this.productPrice == null && this.product != null) {
            this.productPrice = this.product.getPrice();
        }

        if (this.sellerAmount == null) {
            this.sellerAmount = this.productPrice != null ? this.productPrice : BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = RequestStatus.PENDING;
        }

        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.NOT_REQUIRED;
        }

        if (this.paymentProvider == null) {
            this.paymentProvider = PaymentProvider.NONE;
        }
    }

    public Long getId() {
        return id;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getBuyerProtectionFee() {
        return buyerProtectionFee;
    }

    public void setBuyerProtectionFee(BigDecimal buyerProtectionFee) {
        this.buyerProtectionFee = buyerProtectionFee;
    }

    public BigDecimal getSellerAmount() {
        return sellerAmount;
    }

    public void setSellerAmount(BigDecimal sellerAmount) {
        this.sellerAmount = sellerAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentProvider getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(PaymentProvider paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public boolean isBuyerProtectionEnabled() {
        return buyerProtectionEnabled;
    }

    public void setBuyerProtectionEnabled(boolean buyerProtectionEnabled) {
        this.buyerProtectionEnabled = buyerProtectionEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}