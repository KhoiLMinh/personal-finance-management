package com.personal.finance.backend.transactions.service.impl;

import com.personal.finance.backend.budgets.service.BudgetService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.transactions.dto.request.CreateTransactionRequest;
import com.personal.finance.backend.transactions.dto.request.UpdateTransactionRequest;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.dto.response.TransactionHistoryDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.entity.TransactionHistory;
import com.personal.finance.backend.transactions.mapper.TransactionMapper;
import com.personal.finance.backend.transactions.repository.TransactionHistoryRepository;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.transactions.service.TransactionService;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;
    private final BudgetService budgetService;

    @Override
    @Transactional
    public TransactionDTO createTransaction(Long userId, CreateTransactionRequest request) {
        boolean canEditWallet = walletRepository.hasEditPermission(request.getWalletId(), userId);
        if (!canEditWallet) {
            throw new AccessDeniedException("Bạn không có quyền thêm giao dịch vào ví này!");
        }

        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví!"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục hoặc không có quyền sử dụng!"));
        requireMatchingType(category, request.getType());

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setStatus("COMPLETED");

        Transaction savedTransaction = transactionRepository.save(transaction);

        BigDecimal deltaAmount = request.getType() == Transaction.TransactionType.INCOME
                ? request.getAmount()
                : request.getAmount().negate();

        int updatedRows = walletRepository.updateBalance(wallet.getId(), deltaAmount);
        if (updatedRows == 0) {
            throw new RuntimeException("Giao dịch bị từ chối: Số dư ví không đủ để thực hiện khoản chi này!");
        }

        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.checkAndAlertBudget(userId, request.getCategoryId(), request.getDate().getMonthValue(),
                    request.getDate().getYear());
        }

        log.info("Tạo giao dịch thành công ID: {}", savedTransaction.getId());
        return transactionMapper.toDTO(savedTransaction);
    }

    @Override
    public Page<TransactionDTO> filterTransactions(Long userId, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate, String keyword, Pageable pageable) {
        return transactionRepository.filterTransactions(userId, walletId, categoryId, startDate, endDate, keyword, pageable)
                .map(transactionMapper::toDTO);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndAccessibleByUser(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch hoặc truy cập trái phép!"));

        boolean canEditWallet = walletRepository.hasEditPermission(transaction.getWallet().getId(), userId);
        if (!canEditWallet) {
            throw new AccessDeniedException("Bạn không có quyền xóa giao dịch trong ví này!");
        }

        BigDecimal revertAmount = transaction.getType() == Transaction.TransactionType.INCOME
                ? transaction.getAmount().negate()
                : transaction.getAmount();
        if (walletRepository.updateBalance(transaction.getWallet().getId(), revertAmount) == 0) {
            throw new RuntimeException("Không thể xóa: số dư ví sẽ bị âm sau khi hoàn tác khoản thu này!");
        }

        transactionRepository.delete(transaction);
        recheckBudget(userId, transaction.getType(), transaction.getCategory().getId(), transaction.getDate());
        log.info("Đã xóa giao dịch ID: {}", id);
    }

    @Override
    @Transactional
    public TransactionDTO updateTransaction(Long id, Long userId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndAccessibleByUser(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch hoặc truy cập trái phép!"));

        boolean canEditWallet = walletRepository.hasEditPermission(transaction.getWallet().getId(), userId);
        if (!canEditWallet) {
            throw new AccessDeniedException("Bạn không có quyền sửa giao dịch trong ví này!");
        }

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        Long oldCategoryId = transaction.getCategory().getId();
        Transaction.TransactionType oldType = transaction.getType();
        LocalDate oldDate = transaction.getDate();
        if (!oldCategoryId.equals(request.getCategoryId())) {
            requireMatchingType(category, request.getType());
        }

        boolean isChanged = transaction.getAmount().compareTo(request.getAmount()) != 0
                || transaction.getType() != request.getType()
                || !transaction.getDate().equals(request.getDate())
                || !Objects.equals(transaction.getDescription(), request.getDescription())
                || !transaction.getCategory().getId().equals(request.getCategoryId());

        if (isChanged) {
            TransactionHistory history = new TransactionHistory();
            history.setTransaction(transaction);
            history.setOldAmount(transaction.getAmount());
            history.setNewAmount(request.getAmount());
            history.setOldType(transaction.getType());
            history.setNewType(request.getType());
            history.setOldDate(transaction.getDate());
            history.setNewDate(request.getDate());
            history.setOldDescription(transaction.getDescription());
            history.setNewDescription(request.getDescription());
            history.setModifiedBy(userId);
            transactionHistoryRepository.save(history);
        }

        BigDecimal oldImpact = transaction.getType() == Transaction.TransactionType.INCOME
                ? transaction.getAmount() : transaction.getAmount().negate();
        BigDecimal newImpact = request.getType() == Transaction.TransactionType.INCOME
                ? request.getAmount() : request.getAmount().negate();
        BigDecimal netChange = newImpact.subtract(oldImpact);

        if (netChange.compareTo(BigDecimal.ZERO) != 0
                && walletRepository.updateBalance(transaction.getWallet().getId(), netChange) == 0) {
            throw new RuntimeException("Giao dịch bị từ chối: Số dư ví không đủ cho thay đổi này!");
        }

        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        recheckBudget(userId, request.getType(), request.getCategoryId(), request.getDate());
        boolean leftOldBudget = !oldCategoryId.equals(request.getCategoryId())
                || oldType != request.getType()
                || oldDate.getMonthValue() != request.getDate().getMonthValue()
                || oldDate.getYear() != request.getDate().getYear();
        if (leftOldBudget) {
            recheckBudget(userId, oldType, oldCategoryId, oldDate);
        }
        log.info("Cập nhật thành công giao dịch ID: {} bởi UserId: {}", id, userId);

        return transactionMapper.toDTO(updatedTransaction);
    }

    private void requireMatchingType(Category category, Transaction.TransactionType type) {
        if (category.getType() == null || !category.getType().name().equals(type.name())) {
            throw new RuntimeException("Danh mục không phù hợp với loại giao dịch (thu/chi)!");
        }
    }

    private void recheckBudget(Long userId, Transaction.TransactionType type, Long categoryId, LocalDate date) {
        if (type == Transaction.TransactionType.EXPENSE) {
            budgetService.checkAndAlertBudget(userId, categoryId, date.getMonthValue(), date.getYear());
        }
    }

    @Override
    public List<TransactionHistoryDTO> getTransactionHistory(Long id, Long userId) {
        transactionRepository.findByIdAndAccessibleByUser(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch hoặc truy cập trái phép!"));

        return transactionHistoryRepository.findAllByTransactionIdOrderByCreateAtDesc(id)
                .stream()
                .map(transactionMapper::toHistoryDTO)
                .toList();
    }
}