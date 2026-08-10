package com.personal.finance.backend.categories.dto.request;

import com.personal.finance.backend.categories.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryRequest {
    @NotBlank
    private String name;

    @NotNull
    private Category.CategoryType type;

    private String icon;
    private String color;

    private Long parentId;
}