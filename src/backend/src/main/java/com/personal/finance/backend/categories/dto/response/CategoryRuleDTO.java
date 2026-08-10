package com.personal.finance.backend.categories.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRuleDTO {
    private Long id;
    private String keyword;
    private Integer priority;
}