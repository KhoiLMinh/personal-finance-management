package com.personal.finance.backend.transactions.repository;

import com.personal.finance.backend.transactions.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {


    @Query("""
        SELECT t FROM Transaction t 
        LEFT JOIN t.wallet w 
        LEFT JOIN w.members wm 
        WHERE (w.owner.id = :userId OR wm.user.id = :userId) 
        AND t.id = :id
        """)
    Optional<Transaction> findByIdAndAccessibleByUser(@Param("id") Long id, @Param("userId") Long userId);

    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN t.wallet w
        LEFT JOIN w.members wm
        WHERE (w.owner.id = :userId OR wm.user.id = :userId)
        AND (:walletId IS NULL OR w.id = :walletId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:startDate IS NULL OR t.date >= :startDate)
        AND (:endDate IS NULL OR t.date <= :endDate)
        AND (:keyword IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY t.date DESC
        """)
    Page<Transaction> filterTransactions(
            @Param("userId") Long userId,
            @Param("walletId") Long walletId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    boolean existsByWalletIdAndDateAndAmountAndDescription(Long walletId, java.time.LocalDate date, Double amount, String description);
}