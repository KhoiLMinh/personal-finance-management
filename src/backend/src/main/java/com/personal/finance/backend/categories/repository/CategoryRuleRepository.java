package com.personal.finance.backend.categories.repository;

import com.personal.finance.backend.categories.entity.CategoryRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRuleRepository extends JpaRepository<CategoryRule, Long> {

    List<CategoryRule> findAllByCategoryIdOrderByPriorityDesc(Long categoryId);

    Optional<CategoryRule> findByIdAndCategoryId(Long id, Long categoryId);
}