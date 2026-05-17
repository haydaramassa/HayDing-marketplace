package com.hayding.config;

import com.hayding.category.model.Category;
import com.hayding.category.repository.CategoryRepository;
import com.hayding.common.enums.UserRole;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository,
                                      CategoryRepository categoryRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            seedAdminUser(userRepository, passwordEncoder);
            seedCategories(categoryRepository);
        };
    }

    private void seedAdminUser(UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        String adminEmail = "admin@hayding.com";

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User(
                "HayDing Admin",
                adminEmail,
                passwordEncoder.encode("Admin123456"),
                "Berlin",
                "de"
        );

        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);

        System.out.println("Seeded admin user: " + adminEmail);
    }

    private void seedCategories(CategoryRepository categoryRepository) {
        createCategoryIfMissing(
                categoryRepository,
                "Elektronik",
                "إلكترونيات",
                "Electronics",
                "electronics"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Möbel",
                "أثاث",
                "Furniture",
                "furniture"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Kleidung",
                "ملابس",
                "Clothing",
                "clothing"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Schuhe",
                "أحذية",
                "Shoes",
                "shoes"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Haushalt",
                "أدوات منزلية",
                "Household",
                "household"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Bücher",
                "كتب",
                "Books",
                "books"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Spielzeug",
                "ألعاب",
                "Toys",
                "toys"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Sport",
                "رياضة",
                "Sports",
                "sports"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Kinder",
                "أطفال",
                "Kids",
                "kids"
        );

        createCategoryIfMissing(
                categoryRepository,
                "Sonstiges",
                "أخرى",
                "Other",
                "other"
        );
    }

    private void createCategoryIfMissing(CategoryRepository categoryRepository,
                                         String nameDe,
                                         String nameAr,
                                         String nameEn,
                                         String slug) {
        if (categoryRepository.existsBySlug(slug)) {
            return;
        }

        Category category = new Category(nameDe, nameAr, nameEn, slug);
        categoryRepository.save(category);
    }
}