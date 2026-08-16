package com.personal.finance.backend.categories.dto.response;

import com.personal.finance.backend.categories.entity.Category;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryDTO {
    private Long id;
    private String name;
    private Category.CategoryType type;
    private String icon;
    private String color;
    private boolean hidden;
    private Long parentId;
}