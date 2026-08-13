package com.personal.finance.backend.budgets.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBudgetRequest {
    @NotNull(message = "Hạn mức không được để trống")
    @Positive(message = "Hạn mức ngân sách phải lớn hơn 0")
    private Double limitAmount;

    @Positive(message = "Tỷ lệ cảnh báo phải lớn hơn 0")
    private Double warningPercent;
}