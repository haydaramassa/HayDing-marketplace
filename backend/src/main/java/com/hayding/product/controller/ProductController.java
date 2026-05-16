package com.hayding.product.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.product.dto.ProductCreateRequest;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.dto.ProductUpdateRequest;
import com.hayding.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getActiveProducts() {
        List<ProductResponse> products = productService.getActiveProducts();
        return ApiResponse.success("Products fetched successfully", products);
    }

    @GetMapping("/my")
    public ApiResponse<List<ProductResponse>> getMyProducts(Authentication authentication) {
        List<ProductResponse> products = productService.getMyProducts(authentication.getName());
        return ApiResponse.success("My products fetched successfully", products);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ApiResponse.success("Product fetched successfully", product);
    }

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request,
                                                      Authentication authentication) {
        ProductResponse product = productService.createProduct(request, authentication.getName());
        return ApiResponse.success("Product created successfully", product);
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id,
                                                      @Valid @RequestBody ProductUpdateRequest request,
                                                      Authentication authentication) {
        ProductResponse product = productService.updateProduct(id, request, authentication.getName());
        return ApiResponse.success("Product updated successfully", product);
    }

    @PatchMapping("/{id}/mark-sold")
    public ApiResponse<ProductResponse> markProductAsSold(@PathVariable Long id,
                                                          Authentication authentication) {
        ProductResponse product = productService.markProductAsSold(id, authentication.getName());
        return ApiResponse.success("Product marked as sold successfully", product);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id,
                                           Authentication authentication) {
        productService.deleteProduct(id, authentication.getName());
        return ApiResponse.success("Product deleted successfully", null);
    }
}