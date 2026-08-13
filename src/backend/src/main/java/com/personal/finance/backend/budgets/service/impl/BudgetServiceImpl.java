package com.personal.finance.backend.budgets.service.impl;

import com.personal.finance.backend.budgets.dto.request.CreateBudgetRequest;
import com.personal.finance.backend.budgets.dto.request.UpdateBudgetRequest;
import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.budgets.mapper.BudgetMapper;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.budgets.service.BudgetService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;


    private Budget getOwnedBudget(Long id, Long userId) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    log.warn("Truy cập trái phép hoặc không tìm thấy ngân sách. UserId: {}, BudgetId: {}", userId, id);
                    return new RuntimeException("Không tìm thấy ngân sách hoặc bạn không có quyền truy cập!");
                });
    }

    @Override
    @Transactional
    public BudgetDTO createBudget(Long userId, CreateBudgetRequest request) {
        boolean isDuplicate = budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.getCategoryId(), request.getMonth(), request.getYear());

        if (isDuplicate) {
            log.warn("Tạo ngân sách thất bại do trùng lặp. UserId: {}, CategoryId: {}, Kỳ: {}/{}",
                    userId, request.getCategoryId(), request.getMonth(), request.getYear());
            throw new RuntimeException("Bạn đã thiết lập ngân sách cho danh mục này trong tháng "
                    + request.getMonth() + "/" + request.getYear());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        Budget budget = new Budget();
        budget.setCategory(category);
        budget.setUser(user);
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        budget.setLimitAmount(request.getLimitAmount());

        budget.setWarningPercent(request.getWarningPercent() != null ? request.getWarningPercent() : 80.0);
        budget.setStatus(Budget.BudgetStatus.ACTIVE);

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Tạo thành công ngân sách ID: {} cho UserId: {}", savedBudget.getId(), userId);

        return budgetMapper.toDTO(savedBudget);
    }

    @Override
    public Page<BudgetDTO> getBudgets(Long userId, Pageable pageable) {
        return budgetRepository.findAllByUserId(userId, pageable)
                .map(budgetMapper::toDTO);
    }

    @Override
    public BudgetDTO getBudgetById(Long id, Long userId) {
        return budgetMapper.toDTO(getOwnedBudget(id, userId));
    }

    @Override
    @Transactional
    public BudgetDTO updateBudget(Long id, Long userId, UpdateBudgetRequest request) {
        Budget budget = getOwnedBudget(id, userId);

        budget.setLimitAmount(request.getLimitAmount());
        if (request.getWarningPercent() != null) {
            budget.setWarningPercent(request.getWarningPercent());
        }

        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Cập nhật thành công ngân sách ID: {} bởi UserId: {}", id, userId);
        return budgetMapper.toDTO(updatedBudget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id, Long userId) {
        Budget budget = getOwnedBudget(id, userId);
        budgetRepository.delete(budget);
        log.info("Xóa thành công ngân sách ID: {} bởi UserId: {}", id, userId);
    }
}