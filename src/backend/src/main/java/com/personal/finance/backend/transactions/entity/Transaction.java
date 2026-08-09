package com.personal.finance.backend.transactions.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.importBatch.entity.ImportBatch;
import com.personal.finance.backend.wallets.entity.Wallet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Transaction extends Base {

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TransactionType type;

    private String description;

    @Column(nullable = false)
    private LocalDate date;

    private String status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id")
    @JsonIgnore
    private ImportBatch importBatch;

    public enum TransactionType {
        INCOME, EXPENSE
    }
}