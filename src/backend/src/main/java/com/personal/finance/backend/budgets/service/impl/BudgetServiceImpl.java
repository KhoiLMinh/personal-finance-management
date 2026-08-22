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
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.transactions.repository.TransactionRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;


    private Budget getOwnedBudget(Long id, Long userId) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    log.warn("Truy cập trái phép hoặc không tìm thấy ngân sách. UserId: {}, BudgetId: {}", userId, id);
                    return new RuntimeException("Không tìm thấy ngân sách hoặc bạn không có quyền truy cập!");
                });
    }
    //FR-09
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

        Category category = categoryRepository.findByIdAndAccessibleByUser(request.getCategoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục hoặc không có quyền sử dụng!"));

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
    //FR-11
    @Override
    @Transactional
    public void checkAndAlertBudget(Long userId, Long categoryId, int month, int year) {
        budgetRepository.findAllByUserId(userId, Pageable.unpaged()).stream()
                .filter(b -> b.getCategory().getId().equals(categoryId) && b.getMonth() == month && b.getYear() == year)
                .findFirst()
                .ifPresent(budget -> {

                    Double totalSpent = transactionRepository.sumExpenseByCategoryAndMonth(
                            categoryId, userId, month, year, Transaction.TransactionType.EXPENSE);
                    User user = budget.getUser();


                    double warningLimit = budget.getLimitAmount() * (budget.getWarningPercent() / 100.0);


                    if (totalSpent >= budget.getLimitAmount() && budget.getStatus() != Budget.BudgetStatus.EXCEED) {
                        budget.setStatus(Budget.BudgetStatus.EXCEED);
                        budgetRepository.save(budget);

                        String msg = String.format("Bạn đã chi tiêu %s, VƯỢT QUÁ ngân sách %s cho danh mục '%s' trong tháng %d/%d.",
                                totalSpent, budget.getLimitAmount(), budget.getCategory().getName(), month, year);

                        notificationService.createSystemNotification(userId, "Vượt ngân sách chi tiêu!", msg);
                        emailService.sendEmail(user.getEmail(), "Cảnh báo vượt ngân sách - Personal Finance", msg);
                    }

                    else if (totalSpent >= warningLimit && totalSpent < budget.getLimitAmount() && !budget.isWarningSent()) {
                        budget.setWarningSent(true);
                        budgetRepository.save(budget);

                        String msg = String.format("Bạn đã chi tiêu %s, đạt mức cảnh báo %.0f%% ngân sách (%s) cho danh mục '%s' trong tháng %d/%d. Hãy chú ý chi tiêu nhé!",
                                totalSpent, budget.getWarningPercent(), budget.getLimitAmount(), budget.getCategory().getName(), month, year);

                        notificationService.createSystemNotification(userId, "⚠️ Sắp vượt ngân sách!", msg);
                        emailService.sendEmail(user.getEmail(), "Cảnh báo ngân sách - Personal Finance", msg);
                    }
                });
    }
}