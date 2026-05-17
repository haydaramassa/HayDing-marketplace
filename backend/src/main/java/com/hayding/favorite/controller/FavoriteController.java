package com.hayding.favorite.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.favorite.service.FavoriteService;
import com.hayding.product.dto.ProductResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{productId}")
    public ApiResponse<ProductResponse> addToFavorites(@PathVariable Long productId,
                                                       Authentication authentication) {
        ProductResponse product = favoriteService.addToFavorites(productId, authentication.getName());
        return ApiResponse.success("Product added to favorites successfully", product);
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getMyFavorites(Authentication authentication) {
        List<ProductResponse> favorites = favoriteService.getMyFavorites(authentication.getName());
        return ApiResponse.success("Favorites fetched successfully", favorites);
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> removeFromFavorites(@PathVariable Long productId,
                                                 Authentication authentication) {
        favoriteService.removeFromFavorites(productId, authentication.getName());
        return ApiResponse.success("Product removed from favorites successfully", null);
    }
}