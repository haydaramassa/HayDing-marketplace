package com.hayding.favorite.service;

import com.hayding.common.enums.ProductStatus;
import com.hayding.favorite.model.Favorite;
import com.hayding.favorite.repository.FavoriteRepository;
import com.hayding.notification.service.NotificationService;
import com.hayding.product.dto.ProductImageResponse;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.model.Product;
import com.hayding.product.repository.ProductImageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           ProductRepository productRepository,
                           ProductImageRepository productImageRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ProductResponse addToFavorites(Long productId, String userEmail) {
        User user = getUserByEmail(userEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getProductStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active products can be added to favorites");
        }

        if (product.getSeller().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot favorite your own product");
        }

        if (favoriteRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new IllegalArgumentException("Product is already in favorites");
        }

        Favorite favorite = new Favorite(user, product);
        favoriteRepository.save(favorite);

        notificationService.createFavoriteNotification(user, product);

        return toProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyFavorites(String userEmail) {
        User user = getUserByEmail(userEmail);

        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(Favorite::getProduct)
                .map(this::toProductResponse)
                .toList();
    }

    @Transactional
    public void removeFromFavorites(Long productId, String userEmail) {
        User user = getUserByEmail(userEmail);

        if (!favoriteRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new IllegalArgumentException("Product is not in favorites");
        }

        favoriteRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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