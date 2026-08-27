package com.personal.finance.backend.transactions.repository;

import com.personal.finance.backend.transactions.entity.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    List<TransactionHistory> findAllByTransactionIdOrderByCreateAtDesc(Long transactionId);
}