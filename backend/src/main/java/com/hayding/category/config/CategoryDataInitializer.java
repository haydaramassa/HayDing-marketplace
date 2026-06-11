package com.hayding.category.config;

import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategoryDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        createCategoryIfMissing(
                "Sonstiges",
                "أخرى",
                "Others",
                "others"
        );
    }

    private void createCategoryIfMissing(String nameDe,
                                         String nameAr,
                                         String nameEn,
                                         String slug) {
        if (categoryRepository.existsBySlug(slug)) {
            return;
        }

        Category category = new Category(
                nameDe,
                nameAr,
                nameEn,
                slug
        );

        categoryRepository.save(category);
    }
}