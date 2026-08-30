package com.personal.finance.backend.budgets.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category_id", "budget_month", "budget_year"})
)
public class Budget extends Base {

    @Min(1)
    @Max(12)
    @Column(name = "budget_month", nullable = false)
    private Integer month;

    @Column(name = "budget_year", nullable = false)
    private Integer year;

    @Column(nullable = false, precision = 19, scale = 2)
    @Positive
    private BigDecimal limitAmount;

    private Double warningPercent;

    @Column(name = "is_warning_sent", nullable = false)
    private boolean warningSent = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BudgetStatus status = BudgetStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    public enum BudgetStatus {
        ACTIVE, EXCEED
    }
}