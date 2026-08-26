package com.personal.finance.backend.budgets.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateBudgetRequest {
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Tháng không được để trống")
    @Min(value = 1, message = "Tháng phải từ 1 đến 12")
    @Max(value = 12, message = "Tháng phải từ 1 đến 12")
    private Integer month;

    @NotNull(message = "Năm không được để trống")
    private Integer year;

    @NotNull(message = "Hạn mức không được để trống")
    @Positive(message = "Hạn mức ngân sách phải lớn hơn 0")
    private BigDecimal limitAmount;

    @Positive(message = "Tỷ lệ cảnh báo phải lớn hơn 0")
    private Double warningPercent;
}