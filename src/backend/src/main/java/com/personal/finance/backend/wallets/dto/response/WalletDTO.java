package com.personal.finance.backend.wallets.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WalletDTO {
    private Long id;
    private String name;
    private BigDecimal balance;
    private String icon;
    private String color;
    /** Caller's access to this wallet: OWNER, EDIT or VIEW (shared). Null where the caller is unknown (e.g. backup export). */
    private String myPermission;
}