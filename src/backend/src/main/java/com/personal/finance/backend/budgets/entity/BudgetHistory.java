package com.personal.finance.backend.budgets.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class BudgetHistory extends Base {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    @JsonIgnore
    private Budget budget;

    @Column(precision = 19, scale = 2)
    private BigDecimal oldLimitAmount;
    @Column(precision = 19, scale = 2)
    private BigDecimal newLimitAmount;

    private Double oldWarningPercent;
    private Double newWarningPercent;

    @Column(nullable = false)
    private Long modifiedBy;
}