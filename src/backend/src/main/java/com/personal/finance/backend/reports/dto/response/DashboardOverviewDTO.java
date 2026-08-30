package com.personal.finance.backend.reports.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DashboardOverviewDTO {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;

    private Double incomeChangePercent;
    private Double expenseChangePercent;

    private List<CategoryExpenseDTO> expenseByCategory;
    private List<TrendDataDTO> trendData;
}