package com.personal.finance.backend.categories.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryRuleRequest {
    @NotBlank
    private String keyword;

    private Integer priority = 0;
}