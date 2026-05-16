package com.hayding.product.service;

import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import com.hayding.common.enums.ProductStatus;
import com.hayding.product.dto.ProductCreateRequest;
import com.hayding.product.dto.ProductImageResponse;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.model.Product;
import com.hayding.product.model.ProductImage;
import com.hayding.product.repository.ProductImageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          ProductImageRepository productImageRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Product product = new Product(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCity(),
                request.getConditionStatus(),
                seller,
                category
        );

        Product savedProduct = productRepository.save(product);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int index = 0;

            for (String imageUrl : request.getImageUrls()) {
                if (imageUrl == null || imageUrl.isBlank()) {
                    continue;
                }

                ProductImage image = new ProductImage(
                        imageUrl.trim(),
                        savedProduct,
                        index == 0,
                        index
                );

                productImageRepository.save(image);
                index++;
            }
        }

        return getProductById(savedProduct.getId());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByProductStatus(ProductStatus.ACTIVE)
                .stream()
                .map(product -> ProductResponse.fromEntity(
                        product,
                        getImageResponses(product.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return ProductResponse.fromEntity(
                product,
                getImageResponses(product.getId())
        );
    }

    private List<ProductImageResponse> getImageResponses(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId)
                .stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }
}