package com.personal.finance.backend.savingGoals.controller;

import com.personal.finance.backend.savingGoals.dto.request.AddFundRequest;
import com.personal.finance.backend.savingGoals.dto.request.CreateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.request.UpdateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.service.SavingGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/saving-goals")
@RequiredArgsConstructor
public class SavingGoalController {

    private final SavingGoalService savingGoalService;

    @PostMapping
    public ResponseEntity<SavingGoalDTO> createSavingGoal(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateSavingGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savingGoalService.createSavingGoal(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<SavingGoalDTO>> getMySavingGoals(
            @RequestAttribute("userId") Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(savingGoalService.getSavingGoals(userId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingGoalDTO> getSavingGoalById(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(savingGoalService.getSavingGoalById(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingGoalDTO> updateSavingGoal(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSavingGoalRequest request) {
        return ResponseEntity.ok(savingGoalService.updateSavingGoal(id, userId, request));
    }

    @PatchMapping("/{id}/add-funds")
    public ResponseEntity<SavingGoalDTO> addFunds(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody AddFundRequest request) {
        return ResponseEntity.ok(savingGoalService.addFunds(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavingGoal(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        savingGoalService.deleteSavingGoal(id, userId);
        return ResponseEntity.noContent().build();
    }
}