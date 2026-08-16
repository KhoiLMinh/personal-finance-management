package com.personal.finance.backend.wallets.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletMemberDTO {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String permission;
}