package com.hayding.admin.controller;

import com.hayding.category.dto.CategoryCreateRequest;
import com.hayding.category.dto.CategoryResponse;
import com.hayding.category.service.CategoryService;
import com.hayding.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ApiResponse.success("Category created successfully", category);
    }
}