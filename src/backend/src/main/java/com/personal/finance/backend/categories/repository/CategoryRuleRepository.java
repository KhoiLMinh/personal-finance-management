package com.personal.finance.backend.categories.repository;

import com.personal.finance.backend.categories.entity.CategoryRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRuleRepository extends JpaRepository<CategoryRule, Long> {

    List<CategoryRule> findAllByCategoryIdOrderByPriorityDesc(Long categoryId);

    Optional<CategoryRule> findByIdAndCategoryId(Long id, Long categoryId);

    @Query("SELECT r FROM CategoryRule r WHERE r.category.user.id = :userId ORDER BY r.priority DESC")
    List<CategoryRule> findAllByUserIdOrderByPriorityDesc(@Param("userId") Long userId);
}