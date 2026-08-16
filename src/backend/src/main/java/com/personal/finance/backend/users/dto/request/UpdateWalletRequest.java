package com.personal.finance.backend.users.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWalletRequest {
    @NotBlank
    private String name;
    private String icon;
    private String color;
}