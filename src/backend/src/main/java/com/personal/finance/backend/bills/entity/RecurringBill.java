package com.personal.finance.backend.bills.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.users.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class RecurringBill extends Base {

    @NotBlank
    @Column(nullable = false, length = 100)
    private String title;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency;

    private String description;

    @Column(name = "execution_day")
    private Integer executionDay;

    @Column(name = "notification_time")
    private LocalTime notificationTime;

    @Column(name = "last_executed")
    private LocalDate lastExecuted;

    @Column(name = "last_warning")
    private LocalDate lastWarning;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public enum Frequency {
        DAILY, WEEKLY, MONTHLY
    }
}