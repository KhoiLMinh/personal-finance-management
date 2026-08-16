package com.personal.finance.backend.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrendDataDTO {
    private String date;
    private Double income;
    private Double expense;
}