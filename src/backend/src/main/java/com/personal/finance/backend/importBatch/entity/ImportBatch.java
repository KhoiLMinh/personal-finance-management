package com.personal.finance.backend.importBatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.wallets.entity.Wallet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class ImportBatch extends Base {

    private String fileName;
    private Integer totalRows = 0;
    private Integer successRows = 0;
    private Integer duplicatedRows = 0;

    @Column(nullable = false)
    private boolean status = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @OneToMany(mappedBy = "importBatch")
    @JsonIgnore
    private List<Transaction> transactions = new ArrayList<>();
}