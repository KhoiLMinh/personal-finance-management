package com.personal.finance.backend.wallets.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWalletRequest {
    @NotBlank
    private String name;

    @PositiveOrZero
    private Double balance = 0.0;

    private String icon;
    private String color;
}