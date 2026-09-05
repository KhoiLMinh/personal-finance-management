package com.personal.finance.backend.savingGoals.service.impl;

import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.savingGoals.dto.request.AddFundRequest;
import com.personal.finance.backend.savingGoals.dto.request.CreateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.request.UpdateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.mapper.SavingGoalMapper;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.savingGoals.service.SavingGoalService;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final UserRepository userRepository;
    private final SavingGoalMapper savingGoalMapper;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;


    private final CategoryRepository categoryRepository;

    private SavingGoal getOwnedSavingGoal(Long id, Long userId) {
        return savingGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    log.warn("Truy cập trái phép hoặc không tìm thấy mục tiêu. UserId: {}, GoalId: {}", userId, id);
                    return new RuntimeException("Không tìm thấy mục tiêu tiết kiệm hoặc bạn không có quyền truy cập!");
                });
    }

    private Category getOrCreateSavingCategory(Long userId) {
        return categoryRepository.findByNameAndUserId("Chuyển tiền tiết kiệm", userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    Category cat = new Category();
                    cat.setName("Chuyển tiền tiết kiệm");
                    cat.setType(Category.CategoryType.EXPENSE);
                    cat.setUser(user);
                    cat.setColor("#3b82f6"); // Màu xanh dương
                    cat.setIcon("PiggyBank");
                    return categoryRepository.save(cat);
                });
    }
    //FR-10
    @Override
    @Transactional
    public SavingGoalDTO createSavingGoal(Long userId, CreateSavingGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        SavingGoal goal = new SavingGoal();
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setDeadline(request.getDeadline());
        goal.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        goal.setUser(user);

        SavingGoal savedGoal = savingGoalRepository.save(goal);
        log.info("Tạo thành công mục tiêu tiết kiệm ID: {} cho UserId: {}", savedGoal.getId(), userId);
        return savingGoalMapper.toDTO(savedGoal);
    }

    @Override
    public Page<SavingGoalDTO> getSavingGoals(Long userId, Pageable pageable) {
        return savingGoalRepository.findAllByUserId(userId, pageable)
                .map(savingGoalMapper::toDTO);
    }

    @Override
    @Transactional
    public SavingGoalDTO updateSavingGoal(Long id, Long userId, UpdateSavingGoalRequest request) {
        SavingGoal goal = getOwnedSavingGoal(id, userId);

        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(SavingGoal.GoalStatus.COMPLETE);
        } else {
            goal.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        }

        SavingGoal updatedGoal = savingGoalRepository.save(goal);
        log.info("Cập nhật thành công mục tiêu tiết kiệm ID: {} bởi UserId: {}", id, userId);
        return savingGoalMapper.toDTO(updatedGoal);
    }

    //FR-10
    @Override
    @Transactional
    public SavingGoalDTO addFunds(Long id, Long userId, AddFundRequest request) {
        boolean canEditWallet = walletRepository.hasEditPermission(request.getWalletId(), userId);
        if (!canEditWallet) {
            throw new RuntimeException("Bạn không có quyền trích tiền từ ví này!");
        }

        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví!"));

        if (wallet.getBalance().compareTo(request.getAmount()) < 0){
            throw new RuntimeException("Số dư trong ví không đủ để trích vào mục tiêu tiết kiệm!");
        }

        SavingGoal goal = getOwnedSavingGoal(id, userId);
        if (goal.getStatus() == SavingGoal.GoalStatus.COMPLETE) {
            throw new RuntimeException("Mục tiêu này đã hoàn thành, không thể nộp thêm tiền!");
        }


        walletRepository.updateBalance(wallet.getId(), request.getAmount().negate());


        Category savingCategory = getOrCreateSavingCategory(userId);


        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCategory(savingCategory);
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setDate(LocalDate.now());
        transaction.setDescription("Trích tiền tiết kiệm cho mục tiêu: " + goal.getTitle());
        transaction.setStatus("COMPLETED");
        transactionRepository.save(transaction);


        savingGoalRepository.addFundsToGoal(id, userId, request.getAmount());
        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0){
            goal.setStatus(SavingGoal.GoalStatus.COMPLETE);
            savingGoalRepository.save(goal);
            log.info("Mục tiêu tiết kiệm ID: {} đã hoàn thành!", id);
        }

        log.info("Đã trích {} từ ví {} vào mục tiêu ID: {} bởi UserId: {}", request.getAmount(), wallet.getName(), id, userId);
        return savingGoalMapper.toDTO(goal);
    }

    @Override
    @Transactional
    public void deleteSavingGoal(Long id, Long userId) {
        SavingGoal goal = getOwnedSavingGoal(id, userId);
        savingGoalRepository.delete(goal);
        log.info("Xóa thành công mục tiêu tiết kiệm ID: {} bởi UserId: {}", id, userId);
    }
}