package com.personal.finance.backend.transactions.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TransactionDTO {
    private Long id;
    private Long walletId;
    private String walletName;
    private Long categoryId;
    private String categoryName;
    private Double amount;
    private String type;
    private LocalDate date;
    private String description;
}