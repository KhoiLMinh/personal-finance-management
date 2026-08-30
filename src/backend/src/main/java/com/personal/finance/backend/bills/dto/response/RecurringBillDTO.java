package com.personal.finance.backend.bills.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class RecurringBillDTO {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String frequency;
    private LocalDate nextDueDate;
    private String description;
}