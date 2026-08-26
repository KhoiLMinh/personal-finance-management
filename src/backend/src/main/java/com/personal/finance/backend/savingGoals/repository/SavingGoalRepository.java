package com.personal.finance.backend.savingGoals.repository;

import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, Long> {

    Page<SavingGoal> findAllByUserId(Long userId, Pageable pageable);

    Optional<SavingGoal> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("UPDATE SavingGoal sg SET sg.currentAmount = sg.currentAmount + :amount " +
            "WHERE sg.id = :id AND sg.user.id = :userId")
    int addFundsToGoal(@Param("id") Long id, @Param("userId") Long userId, @Param("amount") BigDecimal amount);
}