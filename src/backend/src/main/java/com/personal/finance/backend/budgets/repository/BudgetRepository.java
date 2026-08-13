package com.personal.finance.backend.budgets.repository;

import com.personal.finance.backend.budgets.entity.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Page<Budget> findAllByUserId(Long userId, Pageable pageable);


    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndCategoryIdAndMonthAndYear(Long userId, Long categoryId, Integer month, Integer year);
}