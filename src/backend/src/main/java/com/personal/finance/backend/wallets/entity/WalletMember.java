package com.personal.finance.backend.wallets.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.personal.finance.backend.common.entities.Base;
import com.personal.finance.backend.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        uniqueConstraints = @UniqueConstraint(columnNames = {"wallet_id", "user_id"})
)
public class WalletMember extends Base {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "permissions", nullable = false, length = 20)
    private Permission permissions = Permission.VIEW;

    public enum Permission {
        EDIT, VIEW
    }
}