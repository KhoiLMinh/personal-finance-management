package com.personal.finance.backend.categories.repository;

import com.personal.finance.backend.categories.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserIdOrderByCreateAtDesc(Long userId);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    Optional<Category> findByNameAndUserId(String name, Long userId);
}