package com.personal.finance.backend.transactions.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.importBatch.entity.ImportBatch;
import com.personal.finance.backend.wallets.entity.Wallet;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Transaction extends Base {

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
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

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<TransactionHistory> histories = new java.util.ArrayList<>();

    public enum TransactionType {
        INCOME, EXPENSE
    }
}