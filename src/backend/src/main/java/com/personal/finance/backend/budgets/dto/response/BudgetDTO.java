package com.personal.finance.backend.budgets.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Integer month;
    private Integer year;
    private Double limitAmount;
    private Double warningPercent;
    private String status;
}