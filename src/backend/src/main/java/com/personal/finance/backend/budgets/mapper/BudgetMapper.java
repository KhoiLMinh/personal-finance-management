package com.personal.finance.backend.budgets.mapper;

import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.entity.Budget;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {
    public BudgetDTO toDTO(Budget budget) {
        if (budget == null) return null;

        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        dto.setLimitAmount(budget.getLimitAmount());
        dto.setWarningPercent(budget.getWarningPercent());
        dto.setStatus(budget.getStatus().name());

        if (budget.getCategory() != null) {
            dto.setCategoryId(budget.getCategory().getId());
            dto.setCategoryName(budget.getCategory().getName());
        }

        return dto;
    }
}