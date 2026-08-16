package com.personal.finance.backend.savingGoals.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SavingGoalDTO {
    private Long id;
    private String title;
    private Double targetAmount;
    private Double currentAmount;
    private LocalDate deadline;
    private String status;
}