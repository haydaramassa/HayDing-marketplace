package com.hayding.product.service;

import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import com.hayding.common.enums.ProductStatus;
import com.hayding.product.dto.ProductCreateRequest;
import com.hayding.product.dto.ProductImageResponse;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.dto.ProductUpdateRequest;
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
        User seller = getUserByEmail(sellerEmail);

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

        saveImages(savedProduct, request.getImageUrls());

        return getProductById(savedProduct.getId());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByProductStatus(ProductStatus.ACTIVE)
                .stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);

        return productRepository.findBySellerIdAndProductStatusNot(
                        seller.getId(),
                        ProductStatus.DELETED
                )
                .stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getProductStatus() == ProductStatus.DELETED) {
            throw new IllegalArgumentException("Product not found");
        }

        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long productId,
                                         ProductUpdateRequest request,
                                         String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateProductOwner(product, seller);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            product.setTitle(request.getTitle());
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            product.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }

        if (request.getCity() != null && !request.getCity().isBlank()) {
            product.setCity(request.getCity());
        }

        if (request.getConditionStatus() != null) {
            product.setConditionStatus(request.getConditionStatus());
        }

        if (request.getProductStatus() != null && request.getProductStatus() != ProductStatus.DELETED) {
            product.setProductStatus(request.getProductStatus());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));

            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);

        if (request.getImageUrls() != null) {
            productImageRepository.deleteByProductId(savedProduct.getId());
            saveImages(savedProduct, request.getImageUrls());
        }

        return getProductById(savedProduct.getId());
    }

    @Transactional
    public void deleteProduct(Long productId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateProductOwner(product, seller);

        product.setProductStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse markProductAsSold(Long productId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateProductOwner(product, seller);

        product.setProductStatus(ProductStatus.SOLD);
        Product savedProduct = productRepository.save(product);

        return getProductById(savedProduct.getId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void validateProductOwner(Product product, User seller) {
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("You are not allowed to manage this product");
        }
    }

    private void saveImages(Product product, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        int index = 0;

        for (String imageUrl : imageUrls) {
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }

            ProductImage image = new ProductImage(
                    imageUrl.trim(),
                    product,
                    index == 0,
                    index
            );

            productImageRepository.save(image);
            index++;
        }
    }

    private ProductResponse toProductResponse(Product product) {
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