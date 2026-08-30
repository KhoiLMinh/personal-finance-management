package com.personal.finance.backend.transactions.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionHistoryDTO {
    private Long id;
    private Long transactionId;
    private BigDecimal oldAmount;
    private BigDecimal newAmount;
    private String oldType;
    private String newType;
    private LocalDate oldDate;
    private LocalDate newDate;
    private String oldDescription;
    private String newDescription;
    private Long modifiedBy;
    private LocalDateTime createAt;
}