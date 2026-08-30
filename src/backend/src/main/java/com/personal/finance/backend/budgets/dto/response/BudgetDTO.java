package com.personal.finance.backend.budgets.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Integer month;
    private Integer year;
    private BigDecimal limitAmount;
    private Double warningPercent;
    private String status;
}