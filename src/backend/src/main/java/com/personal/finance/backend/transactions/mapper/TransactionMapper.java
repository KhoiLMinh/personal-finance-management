package com.personal.finance.backend.transactions.mapper;

import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.dto.response.TransactionHistoryDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.entity.TransactionHistory;
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

    public TransactionHistoryDTO toHistoryDTO(TransactionHistory history) {
        if (history == null) return null;
        TransactionHistoryDTO dto = new TransactionHistoryDTO();
        dto.setId(history.getId());
        dto.setTransactionId(history.getTransaction().getId());
        dto.setOldAmount(history.getOldAmount());
        dto.setNewAmount(history.getNewAmount());
        dto.setOldType(history.getOldType() != null ? history.getOldType().name() : null);
        dto.setNewType(history.getNewType() != null ? history.getNewType().name() : null);
        dto.setOldDate(history.getOldDate());
        dto.setNewDate(history.getNewDate());
        dto.setOldDescription(history.getOldDescription());
        dto.setNewDescription(history.getNewDescription());
        dto.setModifiedBy(history.getModifiedBy());
        dto.setCreateAt(history.getCreateAt());
        return dto;
    }
}