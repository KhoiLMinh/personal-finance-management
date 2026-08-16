package com.personal.finance.backend.savingGoals.service;

import com.personal.finance.backend.savingGoals.dto.request.AddFundRequest;
import com.personal.finance.backend.savingGoals.dto.request.CreateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.request.UpdateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SavingGoalService {
    SavingGoalDTO createSavingGoal(Long userId, CreateSavingGoalRequest request);
    Page<SavingGoalDTO> getSavingGoals(Long userId, Pageable pageable);
    SavingGoalDTO getSavingGoalById(Long id, Long userId);
    SavingGoalDTO updateSavingGoal(Long id, Long userId, UpdateSavingGoalRequest request);
    SavingGoalDTO addFunds(Long id, Long userId, AddFundRequest request);
    void deleteSavingGoal(Long id, Long userId);
}