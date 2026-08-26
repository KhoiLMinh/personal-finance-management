package com.personal.finance.backend.wallets.mapper;

import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.dto.response.WalletMemberDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.entity.WalletMember;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {
    public WalletDTO toDTO(Wallet wallet) {
        if (wallet == null) return null;
        WalletDTO dto = new WalletDTO();
        dto.setId(wallet.getId());
        dto.setName(wallet.getName());
        dto.setBalance(wallet.getBalance());
        dto.setIcon(wallet.getIcon());
        dto.setColor(wallet.getColor());
        return dto;
    }

    public WalletMemberDTO toMemberDTO(WalletMember member){
        if (member == null) return null;
        WalletMemberDTO dto = new WalletMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setFullName(member.getUser().getFullName());
        dto.setPermission(member.getPermissions().name());
        return dto;
    }
}