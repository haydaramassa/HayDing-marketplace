package com.hayding.category.config;

import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategoryDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        fixOtherCategory();
    }

    private void fixOtherCategory() {
        Optional<Category> otherCategory = categoryRepository.findBySlug("other");
        Optional<Category> othersCategory = categoryRepository.findBySlug("others");

        if (otherCategory.isPresent()) {
            Category category = otherCategory.get();

            category.setNameDe("Sonstiges");
            category.setNameAr("أخرى");
            category.setNameEn("Others");
            category.setActive(true);

            categoryRepository.save(category);

            if (othersCategory.isPresent()) {
                categoryRepository.delete(othersCategory.get());
            }

            return;
        }

        if (othersCategory.isPresent()) {
            Category category = othersCategory.get();

            category.setNameDe("Sonstiges");
            category.setNameAr("أخرى");
            category.setNameEn("Others");
            category.setSlug("other");
            category.setActive(true);

            categoryRepository.save(category);
            return;
        }

        Category category = new Category(
                "Sonstiges",
                "أخرى",
                "Others",
                "other"
        );

        categoryRepository.save(category);
    }
}