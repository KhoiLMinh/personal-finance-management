package com.personal.finance.backend.budgets.service;

import com.personal.finance.backend.budgets.dto.request.CreateBudgetRequest;
import com.personal.finance.backend.budgets.dto.request.UpdateBudgetRequest;
import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.dto.response.BudgetHistoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BudgetService {
    BudgetDTO createBudget(Long userId, CreateBudgetRequest request);
    Page<BudgetDTO> getBudgets(Long userId, Pageable pageable);
    BudgetDTO getBudgetById(Long id, Long userId);
    BudgetDTO updateBudget(Long id, Long userId, UpdateBudgetRequest request);
    void deleteBudget(Long id, Long userId);

    void checkAndAlertBudget(Long userId, Long categoryId, int month, int year);
    List<BudgetHistoryDTO> getBudgetHistory(Long id, Long userId);
}