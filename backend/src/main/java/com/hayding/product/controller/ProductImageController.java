package com.hayding.product.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.product.service.FileStorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {

    private final FileStorageService fileStorageService;

    public ProductImageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ApiResponse<String> uploadProductImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = fileStorageService.storeProductImage(file);
        return ApiResponse.success("Image uploaded successfully", imageUrl);
    }
}