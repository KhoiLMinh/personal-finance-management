package com.personal.finance.backend.categories.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryRequest {
    @NotBlank
    private String name;
    private String icon;
    private String color;
}