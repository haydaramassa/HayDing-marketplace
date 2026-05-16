package com.hayding.category.repository;

import com.hayding.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByActiveTrue();

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);
}