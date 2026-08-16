package com.personal.finance.backend.categories.service.impl;

import com.personal.finance.backend.categories.dto.request.CreateCategoryRequest;
import com.personal.finance.backend.categories.dto.request.CreateCategoryRuleRequest;
import com.personal.finance.backend.categories.dto.request.UpdateCategoryRequest;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.dto.response.CategoryRuleDTO;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import com.personal.finance.backend.categories.mapper.CategoryMapper;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.categories.service.CategoryService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryRuleRepository categoryRuleRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    private Category getOwnedCategory(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(Long userId, CreateCategoryRequest request) {
        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Category category = new Category();
        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setUser(user);

        if (request.getParentId() != null) {
            Category parent = getOwnedCategory(request.getParentId(), userId);
            if (parent.getType() != request.getType()) {
                throw new RuntimeException("Danh mục con phải cùng loại với danh mục cha!");
            }
            category.setParent(parent);
        }

        return this.categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    public List<CategoryDTO> getCategoriesForUser(Long userId) {
        return this.categoryRepository.findAllByUserIdOrderByCreateAtDesc(userId)
                .stream()
                .map(categoryMapper::toDTO)
                .toList();
    }

    @Override
    public CategoryDTO getCategoryById(Long id, Long userId) {
        return categoryMapper.toDTO(getOwnedCategory(id, userId));
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, Long userId, UpdateCategoryRequest request) {
        Category category = getOwnedCategory(id, userId);
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void hideCategory(Long id, Long userId) {
        Category category = getOwnedCategory(id, userId);
        category.setHidden(true);
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, Long userId) {
        Category category = getOwnedCategory(id, userId);
        if (!category.getTransactions().isEmpty() || !category.getBudgets().isEmpty()) {
            throw new RuntimeException(
                    "Danh mục đã có giao dịch hoặc ngân sách liên quan, không thể xoá. Hãy ẩn danh mục thay vì xoá!");
        }

        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public CategoryRuleDTO addRule(Long categoryId, Long userId, CreateCategoryRuleRequest request) {
        Category category = getOwnedCategory(categoryId, userId);

        CategoryRule rule = new CategoryRule();
        rule.setKeyword(request.getKeyword());
        rule.setPriority(request.getPriority() == null ? 0 : request.getPriority());
        rule.setCategory(category);

        return categoryMapper.toDTO(categoryRuleRepository.save(rule));
    }

    @Override
    public List<CategoryRuleDTO> getRules(Long categoryId, Long userId) {
        getOwnedCategory(categoryId, userId);
        return categoryRuleRepository.findAllByCategoryIdOrderByPriorityDesc(categoryId)
                .stream()
                .map(categoryMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteRule(Long categoryId, Long ruleId, Long userId) {
        getOwnedCategory(categoryId, userId);

        CategoryRule rule = categoryRuleRepository.findByIdAndCategoryId(ruleId, categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quy tắc phân loại!"));

        categoryRuleRepository.delete(rule);
    }
}