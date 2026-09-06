package com.personal.finance.backend.budgets.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BudgetHistoryDTO {
    private Long id;
    private Long budgetId;
    private BigDecimal oldLimitAmount;
    private BigDecimal newLimitAmount;
    private Double oldWarningPercent;
    private Double newWarningPercent;
    private Long modifiedBy;
    private LocalDateTime createAt;
}