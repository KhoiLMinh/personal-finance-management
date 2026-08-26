package com.personal.finance.backend.wallets.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateWalletRequest {
    @NotBlank
    private String name;

    @PositiveOrZero
    @Column(precision = 19, scale = 2)
    private BigDecimal balance;

    private String icon;
    private String color;
}