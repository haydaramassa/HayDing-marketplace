package com.hayding.category.dto;

import com.hayding.category.model.Category;

public class CategoryResponse {

    private Long id;
    private String nameDe;
    private String nameAr;
    private String nameEn;
    private String slug;
    private boolean active;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id,
                            String nameDe,
                            String nameAr,
                            String nameEn,
                            String slug,
                            boolean active) {
        this.id = id;
        this.nameDe = nameDe;
        this.nameAr = nameAr;
        this.nameEn = nameEn;
        this.slug = slug;
        this.active = active;
    }

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) {
            return null;
        }

        return new CategoryResponse(
                category.getId(),
                category.getNameDe(),
                category.getNameAr(),
                category.getNameEn(),
                category.getSlug(),
                category.isActive()
        );
    }

    public Long getId() {
        return id;
    }

    public String getNameDe() {
        return nameDe;
    }

    public String getNameAr() {
        return nameAr;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getSlug() {
        return slug;
    }

    public boolean isActive() {
        return active;
    }
}