package com.personal.finance.backend.mappers;

import com.personal.finance.backend.dtos.response.WalletDTO;
import com.personal.finance.backend.entities.Wallet;
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
}