package com.personal.finance.backend.transactions.repository;

import com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // EXISTS instead of LEFT JOIN members: a join repeats each row once per wallet member and inflates SUMs
    String ACCESSIBLE_BY_USER = "(w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId)) ";


    @Query("""
        SELECT t FROM Transaction t 
        JOIN t.wallet w
        WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))
        AND t.id = :id
        """)
    Optional<Transaction> findByIdAndAccessibleByUser(@Param("id") Long id, @Param("userId") Long userId);

    @Query("""
        SELECT t FROM Transaction t
        JOIN t.wallet w
        WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))
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

    boolean existsByWalletIdAndDateAndAmountAndDescription(Long walletId, LocalDate date, BigDecimal amount, String description);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t " +
            "JOIN t.wallet w " +
            "WHERE t.category.id = :categoryId AND " + ACCESSIBLE_BY_USER +
            "AND t.type = :type AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    BigDecimal sumExpenseByCategoryAndMonth(
            @Param("categoryId") Long categoryId,
            @Param("userId") Long userId,
            @Param("month") Integer month,
            @Param("year") Integer year,
            @Param("type") Transaction.TransactionType type);


    @Query("""
        SELECT COALESCE(SUM(t.amount), 0.0) 
        FROM Transaction t 
        JOIN t.wallet w
        WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))
        AND t.type = :type 
        AND (:startDate IS NULL OR t.date >= :startDate) 
        AND (:endDate IS NULL OR t.date <= :endDate)
        """)
    BigDecimal getTotalAmountByType(
            @Param("userId") Long userId,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);


    @Query("""
        SELECT new com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO(
            c.id, c.name, c.color, SUM(t.amount)
        )
        FROM Transaction t 
        JOIN t.category c 
        JOIN t.wallet w
        WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))
        AND t.type = 'EXPENSE' 
        AND (:startDate IS NULL OR t.date >= :startDate) 
        AND (:endDate IS NULL OR t.date <= :endDate)
        GROUP BY c.id, c.name, c.color
        ORDER BY SUM(t.amount) DESC
        """)
    List<CategoryExpenseDTO> getExpenseByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT t.date, t.type, SUM(t.amount) 
        FROM Transaction t 
        JOIN t.wallet w
        WHERE (w.owner.id = :userId OR EXISTS (SELECT 1 FROM WalletMember wm WHERE wm.wallet = w AND wm.user.id = :userId))
        AND t.date >= :startDate AND t.date <= :endDate 
        GROUP BY t.date, t.type 
        ORDER BY t.date ASC
    """)
    List<Object[]> getTrendData(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}