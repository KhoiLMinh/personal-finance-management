package com.personal.finance.backend.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletDTO {
    private Long id;
    private String name;
    private Double balance;
    private String icon;
    private String color;
}