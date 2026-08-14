package com.personal.finance.backend.transactions.mapper;

import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    public TransactionDTO toDTO(Transaction transaction) {
        if (transaction == null) return null;

        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType().name());
        dto.setDate(transaction.getDate());
        dto.setDescription(transaction.getDescription());

        if (transaction.getWallet() != null) {
            dto.setWalletId(transaction.getWallet().getId());
            dto.setWalletName(transaction.getWallet().getName());
        }

        if (transaction.getCategory() != null) {
            dto.setCategoryId(transaction.getCategory().getId());
            dto.setCategoryName(transaction.getCategory().getName());
        }

        return dto;
    }
}