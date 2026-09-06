package com.personal.finance.backend.transactions.service;

import com.personal.finance.backend.transactions.dto.request.CreateTransactionRequest;
import com.personal.finance.backend.transactions.dto.request.UpdateTransactionRequest;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.dto.response.TransactionHistoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionDTO createTransaction(Long userId, CreateTransactionRequest request);
    Page<TransactionDTO> filterTransactions(Long userId, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate, String keyword, Pageable pageable);
    void deleteTransaction(Long id, Long userId);
    TransactionDTO updateTransaction(Long id, Long userId, UpdateTransactionRequest request);
    List<TransactionHistoryDTO> getTransactionHistory(Long id, Long userId);
}