package com.personal.finance.backend.transactions.dto.request;

import com.personal.finance.backend.transactions.entity.Transaction;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UpdateTransactionRequest {
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền giao dịch phải lớn hơn 0")
    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Loại giao dịch không được để trống")
    private Transaction.TransactionType type;

    @NotNull(message = "Ngày giao dịch không được để trống")
    private LocalDate date;

    private String description;
}