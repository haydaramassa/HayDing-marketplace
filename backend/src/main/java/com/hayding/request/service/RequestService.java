package com.hayding.request.service;

import com.hayding.common.enums.ProductStatus;
import com.hayding.common.enums.RequestStatus;
import com.hayding.product.dto.ProductImageResponse;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.model.Product;
import com.hayding.product.repository.ProductImageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.request.dto.CreateRequestDto;
import com.hayding.request.dto.RequestResponse;
import com.hayding.request.model.Request;
import com.hayding.request.repository.RequestRepository;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public RequestService(RequestRepository requestRepository,
                          ProductRepository productRepository,
                          ProductImageRepository productImageRepository,
                          UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RequestResponse createRequest(CreateRequestDto dto, String buyerEmail) {
        User buyer = getUserByEmail(buyerEmail);

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getProductStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active products can receive requests");
        }

        User seller = product.getSeller();

        if (seller.getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot create a request for your own product");
        }

        if (requestRepository.existsByBuyerIdAndProductId(buyer.getId(), product.getId())) {
            throw new IllegalArgumentException("You already sent a request for this product");
        }

        Request request = new Request(
                buyer,
                seller,
                product,
                dto.getMessage()
        );

        Request savedRequest = requestRepository.save(request);

        return toRequestResponse(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> getSentRequests(String buyerEmail) {
        User buyer = getUserByEmail(buyerEmail);

        return requestRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId())
                .stream()
                .map(this::toRequestResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> getReceivedRequests(String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);

        return requestRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId())
                .stream()
                .map(this::toRequestResponse)
                .toList();
    }

    @Transactional
    public RequestResponse acceptRequest(Long requestId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);
        Request request = getRequestById(requestId);

        validateSeller(request, seller);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be accepted");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        Request savedRequest = requestRepository.save(request);

        Product product = request.getProduct();
        product.setProductStatus(ProductStatus.RESERVED);
        productRepository.save(product);

        return toRequestResponse(savedRequest);
    }

    @Transactional
    public RequestResponse rejectRequest(Long requestId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);
        Request request = getRequestById(requestId);

        validateSeller(request, seller);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        request.setStatus(RequestStatus.REJECTED);
        Request savedRequest = requestRepository.save(request);

        return toRequestResponse(savedRequest);
    }

    @Transactional
    public RequestResponse cancelRequest(Long requestId, String buyerEmail) {
        User buyer = getUserByEmail(buyerEmail);
        Request request = getRequestById(requestId);

        validateBuyer(request, buyer);

        if (request.getStatus() != RequestStatus.PENDING
                && request.getStatus() != RequestStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only pending or accepted requests can be cancelled");
        }

        request.setStatus(RequestStatus.CANCELLED);
        Request savedRequest = requestRepository.save(request);

        if (request.getProduct().getProductStatus() == ProductStatus.RESERVED) {
            request.getProduct().setProductStatus(ProductStatus.ACTIVE);
            productRepository.save(request.getProduct());
        }

        return toRequestResponse(savedRequest);
    }

    @Transactional
    public RequestResponse completeRequest(Long requestId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);
        Request request = getRequestById(requestId);

        validateSeller(request, seller);

        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only accepted requests can be completed");
        }

        request.setStatus(RequestStatus.COMPLETED);
        Request savedRequest = requestRepository.save(request);

        Product product = request.getProduct();
        product.setProductStatus(ProductStatus.SOLD);
        productRepository.save(product);

        return toRequestResponse(savedRequest);
    }

    private Request getRequestById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void validateBuyer(Request request, User buyer) {
        if (!request.getBuyer().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You are not allowed to manage this request");
        }
    }

    private void validateSeller(Request request, User seller) {
        if (!request.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("You are not allowed to manage this request");
        }
    }

    private RequestResponse toRequestResponse(Request request) {
        ProductResponse productResponse = toProductResponse(request.getProduct());
        return RequestResponse.fromEntity(request, productResponse);
    }

    private ProductResponse toProductResponse(Product product) {
        List<ProductImageResponse> images = productImageRepository
                .findByProductIdOrderBySortOrderAsc(product.getId())
                .stream()
                .map(ProductImageResponse::fromEntity)
                .toList();

        return ProductResponse.fromEntity(product, images);
    }
}