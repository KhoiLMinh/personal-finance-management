package com.personal.finance.backend.transactions.service;

import com.personal.finance.backend.transactions.dto.request.CreateTransactionRequest;
import com.personal.finance.backend.transactions.dto.request.UpdateTransactionRequest;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface TransactionService {
    TransactionDTO createTransaction(Long userId, CreateTransactionRequest request);
    Page<TransactionDTO> filterTransactions(Long userId, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate, String keyword, Pageable pageable);
    TransactionDTO getTransactionById(Long id, Long userId);
    void deleteTransaction(Long id, Long userId);

    TransactionDTO updateTransaction(Long id, Long userId, UpdateTransactionRequest request);
}