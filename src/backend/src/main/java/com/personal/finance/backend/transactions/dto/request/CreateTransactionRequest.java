package com.personal.finance.backend.transactions.dto.request;

import com.personal.finance.backend.transactions.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTransactionRequest {
    @NotNull(message = "Ví không được để trống")
    private Long walletId;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền giao dịch phải lớn hơn 0")
    private Double amount;

    @NotNull(message = "Loại giao dịch không được để trống")
    private Transaction.TransactionType type;

    @NotNull(message = "Ngày giao dịch không được để trống")
    private LocalDate date;

    private String description;
}