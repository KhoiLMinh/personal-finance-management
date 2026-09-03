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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    //FR-05, FR-15
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
            Category parent = categoryRepository.findByIdAndAccessibleByUser(request.getParentId(), userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha!"));
            if (parent.getType() != request.getType()) {
                throw new RuntimeException("Danh mục con phải cùng loại với danh mục cha!");
            }
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);

        if (user.getRole() == User.Role.ADMIN) {
            List<User> allUsers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.USER)
                    .toList();

            for (User u : allUsers) {
                if (categoryRepository.findByNameAndUserId(savedCategory.getName(), u.getId()).isEmpty()) {
                    Category clone = new Category();
                    clone.setName(savedCategory.getName());
                    clone.setType(savedCategory.getType());
                    clone.setIcon(savedCategory.getIcon());
                    clone.setColor(savedCategory.getColor());
                    clone.setUser(u);

                    if (savedCategory.getParent() != null) {
                        categoryRepository.findByNameAndUserId(savedCategory.getParent().getName(), u.getId())
                                .ifPresent(clone::setParent);
                    }
                    categoryRepository.save(clone);
                }
            }
        }

        return this.categoryMapper.toDTO(savedCategory);
    }

    @Override
    public List<CategoryDTO> getCategoriesForUser(Long userId) {
        return this.categoryRepository.findAvailableCategories(userId)
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
    public void unhideCategory(Long id, Long userId) {
        Category category = getOwnedCategory(id, userId);
        category.setHidden(false);
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void cloneAdminCategoriesForNewUser(User newUser) {
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null || admin.getId().equals(newUser.getId())) return;

        List<Category> adminCats = categoryRepository.findAllByUserIdOrderByCreateAtDesc(admin.getId());
        Map<Long, Category> parentMap = new HashMap<>();

        for (Category adminCat : adminCats) {
            if (adminCat.getParent() == null) {
                Category clone = new Category();
                clone.setName(adminCat.getName());
                clone.setType(adminCat.getType());
                clone.setIcon(adminCat.getIcon());
                clone.setColor(adminCat.getColor());
                clone.setUser(newUser);
                clone.setHidden(adminCat.isHidden());
                parentMap.put(adminCat.getId(), categoryRepository.save(clone));
            }
        }

        for (Category adminCat : adminCats) {
            if (adminCat.getParent() != null) {
                Category clone = new Category();
                clone.setName(adminCat.getName());
                clone.setType(adminCat.getType());
                clone.setIcon(adminCat.getIcon());
                clone.setColor(adminCat.getColor());
                clone.setUser(newUser);
                clone.setHidden(adminCat.isHidden());
                clone.setParent(parentMap.get(adminCat.getParent().getId()));
                Category savedClone = categoryRepository.save(clone);
                parentMap.put(adminCat.getId(), savedClone);
            }
        }

        for (Category adminCat : adminCats) {
            if (parentMap.containsKey(adminCat.getId())) {
                List<CategoryRule> rules = categoryRuleRepository.findAllByCategoryIdOrderByPriorityDesc(adminCat.getId());
                for (CategoryRule r : rules) {
                    CategoryRule cr = new CategoryRule();
                    cr.setKeyword(r.getKeyword());
                    cr.setPriority(r.getPriority());
                    cr.setCategory(parentMap.get(adminCat.getId()));
                    categoryRuleRepository.save(cr);
                }
            }
        }
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

        CategoryRule savedRule = categoryRuleRepository.save(rule);

        // NẾU ADMIN TẠO TỪ KHÓA MẪU MỚI -> PHÁT THÊM CHO TẤT CẢ USER HIỆN CÓ
        if (category.getUser().getRole() == User.Role.ADMIN) {
            List<User> allUsers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.USER)
                    .toList();

            for (User u : allUsers) {
                categoryRepository.findByNameAndUserId(category.getName(), u.getId()).ifPresent(userCat -> {
                    boolean ruleExists = categoryRuleRepository.findAllByCategoryIdOrderByPriorityDesc(userCat.getId())
                            .stream().anyMatch(r -> r.getKeyword().equalsIgnoreCase(savedRule.getKeyword()));

                    if (!ruleExists) {
                        CategoryRule cloneRule = new CategoryRule();
                        cloneRule.setKeyword(savedRule.getKeyword());
                        cloneRule.setPriority(savedRule.getPriority());
                        cloneRule.setCategory(userCat);
                        categoryRuleRepository.save(cloneRule);
                    }
                });
            }
        }

        return categoryMapper.toDTO(savedRule);
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