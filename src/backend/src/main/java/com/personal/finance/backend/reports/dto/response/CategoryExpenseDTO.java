package com.personal.finance.backend.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryExpenseDTO {
    private Long categoryId;
    private String categoryName;
    private String color;
    private Double totalAmount;
}