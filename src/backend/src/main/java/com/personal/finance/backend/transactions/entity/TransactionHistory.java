package com.personal.finance.backend.transactions.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class TransactionHistory extends Base {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    private Transaction transaction;

    @Column(precision = 19, scale = 2)
    private BigDecimal oldAmount;
    @Column(precision = 19, scale = 2)
    private BigDecimal newAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Transaction.TransactionType oldType;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Transaction.TransactionType newType;

    private LocalDate oldDate;
    private LocalDate newDate;

    private String oldDescription;
    private String newDescription;

    @Column(nullable = false)
    private Long modifiedBy;
}