package com.hayding.product.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.product.dto.ProductCreateRequest;
import com.hayding.product.dto.ProductResponse;
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
}