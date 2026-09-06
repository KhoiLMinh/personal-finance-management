package com.personal.finance.backend.categories.service;

import com.personal.finance.backend.categories.dto.request.CreateCategoryRequest;
import com.personal.finance.backend.categories.dto.request.CreateCategoryRuleRequest;
import com.personal.finance.backend.categories.dto.request.UpdateCategoryRequest;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.dto.response.CategoryRuleDTO;
import com.personal.finance.backend.users.entity.User;

import java.util.List;

public interface CategoryService {
    CategoryDTO createCategory(Long userId, CreateCategoryRequest request);
    List<CategoryDTO> getCategoriesForUser(Long userId);
    CategoryDTO updateCategory(Long id, Long userId, UpdateCategoryRequest request);
    void hideCategory(Long id, Long userId);
    void unhideCategory(Long id, Long userId);
    void deleteCategory(Long id, Long userId);
    void cloneAdminCategoriesForNewUser(User newUser);

    CategoryRuleDTO addRule(Long categoryId, Long userId, CreateCategoryRuleRequest request);
    List<CategoryRuleDTO> getRules(Long categoryId, Long userId);
    void deleteRule(Long categoryId, Long ruleId, Long userId);
}