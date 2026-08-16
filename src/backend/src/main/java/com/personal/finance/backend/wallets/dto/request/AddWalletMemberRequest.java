package com.personal.finance.backend.wallets.dto.request;

import com.personal.finance.backend.wallets.entity.WalletMember;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddWalletMemberRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotNull(message = "Vui lòng chọn quyền truy cập")
    private WalletMember.Permission permission;
}