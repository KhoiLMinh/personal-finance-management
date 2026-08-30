package com.personal.finance.backend.bills.dto.request;

import com.personal.finance.backend.bills.entity.RecurringBill;
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
public class CreateRecurringBillRequest {
    @NotBlank(message = "Tên hóa đơn không được để trống")
    private String title;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Vui lòng chọn chu kỳ lặp")
    private RecurringBill.Frequency frequency;

    @NotNull(message = "Ngày đến hạn không được để trống")
    @FutureOrPresent(message = "Ngày đến hạn phải từ hôm nay trở đi")
    private LocalDate nextDueDate;

    private String description;
}