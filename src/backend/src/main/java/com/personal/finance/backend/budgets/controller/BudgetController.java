package com.personal.finance.backend.budgets.controller;

import com.personal.finance.backend.budgets.dto.request.CreateBudgetRequest;
import com.personal.finance.backend.budgets.dto.request.UpdateBudgetRequest;
import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.dto.response.BudgetHistoryDTO;
import com.personal.finance.backend.budgets.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateBudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<BudgetDTO>> getMyBudgets(
            @RequestAttribute("userId") Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(budgetService.getBudgets(userId, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        budgetService.deleteBudget(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<java.util.List<BudgetHistoryDTO>> getBudgetHistory(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetHistory(id, userId));
    }
}