package com.personal.finance.backend.reports.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DashboardOverviewDTO {
    private Double totalBalance;
    private Double totalIncome;
    private Double totalExpense;
    private Double netSavings;

    private Double incomeChangePercent;
    private Double expenseChangePercent;

    private List<CategoryExpenseDTO> expenseByCategory;

    private List<TrendDataDTO> trendData;
}