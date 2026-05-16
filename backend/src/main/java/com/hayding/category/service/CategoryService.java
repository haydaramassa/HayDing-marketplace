package com.hayding.category.service;

import com.hayding.category.dto.CategoryCreateRequest;
import com.hayding.category.dto.CategoryResponse;
import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category slug is already in use");
        }

        Category category = new Category(
                request.getNameDe(),
                request.getNameAr(),
                request.getNameEn(),
                request.getSlug()
        );

        Category savedCategory = categoryRepository.save(category);

        return CategoryResponse.fromEntity(savedCategory);
    }
}