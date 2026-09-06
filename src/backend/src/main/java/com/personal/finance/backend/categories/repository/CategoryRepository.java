// src/backend/src/main/java/com/personal/finance/backend/categories/repository/CategoryRepository.java
package com.personal.finance.backend.categories.repository;

import com.personal.finance.backend.categories.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserIdOrderByCreateAtDesc(Long userId);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    Optional<Category> findByNameAndUserId(String name, Long userId);

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId ORDER BY c.createAt DESC")
    List<Category> findAvailableCategories(@Param("userId") Long userId);

    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.user.id = :userId")
    Optional<Category> findByIdAndAccessibleByUser(@Param("id") Long id, @Param("userId") Long userId);
}