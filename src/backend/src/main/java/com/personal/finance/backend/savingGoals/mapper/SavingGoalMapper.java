package com.personal.finance.backend.savingGoals.mapper;

import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import org.springframework.stereotype.Component;

@Component
public class SavingGoalMapper {
    public SavingGoalDTO toDTO(SavingGoal savingGoal) {
        if (savingGoal == null) return null;

        SavingGoalDTO dto = new SavingGoalDTO();
        dto.setId(savingGoal.getId());
        dto.setTitle(savingGoal.getTitle());
        dto.setTargetAmount(savingGoal.getTargetAmount());
        dto.setCurrentAmount(savingGoal.getCurrentAmount());
        dto.setDeadline(savingGoal.getDeadline());
        dto.setStatus(savingGoal.getStatus().name());
        return dto;
    }
}