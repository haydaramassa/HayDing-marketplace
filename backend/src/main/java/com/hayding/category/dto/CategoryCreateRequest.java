package com.hayding.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String nameDe;

    @NotBlank
    @Size(max = 100)
    private String nameAr;

    @NotBlank
    @Size(max = 100)
    private String nameEn;

    @NotBlank
    @Size(max = 120)
    private String slug;

    public CategoryCreateRequest() {
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
}