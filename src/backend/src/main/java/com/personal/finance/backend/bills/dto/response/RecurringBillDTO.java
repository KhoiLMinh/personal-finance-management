package com.personal.finance.backend.bills.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class RecurringBillDTO {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String frequency;
    private String description;
    private Integer executionDay;
    private String notificationTime;
    private LocalDateTime createAt;
}