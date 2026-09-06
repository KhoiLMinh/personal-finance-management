package com.personal.finance.backend.bills.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.personal.finance.backend.bills.entity.RecurringBill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
public class UpdateRecurringBillRequest {
    @NotBlank(message = "Tên hóa đơn không được để trống")
    private String title;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Vui lòng chọn chu kỳ lặp")
    private RecurringBill.Frequency frequency;

    private Integer executionDay;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime notificationTime;
}