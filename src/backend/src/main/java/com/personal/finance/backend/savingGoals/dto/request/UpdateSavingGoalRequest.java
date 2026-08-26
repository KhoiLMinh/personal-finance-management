package com.personal.finance.backend.savingGoals.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UpdateSavingGoalRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotNull(message = "Số tiền mục tiêu không được để trống")
    @Positive(message = "Số tiền mục tiêu phải lớn hơn 0")
    @Column(precision = 19, scale = 2)
    private BigDecimal targetAmount;

    @NotNull(message = "Thời hạn không được để trống")
    @FutureOrPresent(message = "Thời hạn phải từ hôm nay trở đi")
    private LocalDate deadline;
}