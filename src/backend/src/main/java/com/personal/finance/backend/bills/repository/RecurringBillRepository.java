package com.personal.finance.backend.bills.repository;

import com.personal.finance.backend.bills.entity.RecurringBill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringBillRepository extends JpaRepository<RecurringBill, Long> {
    Page<RecurringBill> findAllByUserId(Long userId, Pageable pageable);
    Optional<RecurringBill> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r FROM RecurringBill r WHERE r.nextDueDate <= :today")
    List<RecurringBill> findAllDueBills(@Param("today") LocalDate today);
}