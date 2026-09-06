package com.personal.finance.backend.budgets.repository;

import com.personal.finance.backend.budgets.entity.BudgetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetHistoryRepository extends JpaRepository<BudgetHistory, Long> {
    List<BudgetHistory> findAllByBudgetIdOrderByCreateAtDesc(Long budgetId);
}