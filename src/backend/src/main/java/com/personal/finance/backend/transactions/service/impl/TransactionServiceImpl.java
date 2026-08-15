package com.personal.finance.backend.transactions.service.impl;

import com.personal.finance.backend.budgets.service.BudgetService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.transactions.dto.request.CreateTransactionRequest;
import com.personal.finance.backend.transactions.dto.request.UpdateTransactionRequest;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.mapper.TransactionMapper;
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

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;
    private final BudgetService budgetService;

    @Override
    @Transactional
    public TransactionDTO createTransaction(Long userId, CreateTransactionRequest request) {
        boolean canEditWallet = walletRepository.hasEditPermission(request.getWalletId(), userId);
        if (!canEditWallet) {
            log.warn("Truy cập trái phép: User {} cố gắng tạo giao dịch trên Wallet {}", userId, request.getWalletId());
            throw new AccessDeniedException("Bạn không có quyền thêm giao dịch vào ví này!");
        }

        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví!"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setStatus("COMPLETED");

        Transaction savedTransaction = transactionRepository.save(transaction);

        Double deltaAmount = request.getType() == Transaction.TransactionType.INCOME
                ? request.getAmount()
                : -request.getAmount();
        walletRepository.updateBalance(wallet.getId(), deltaAmount);

        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.checkAndAlertBudget(
                    userId,
                    request.getCategoryId(),
                    request.getDate().getMonthValue(),
                    request.getDate().getYear()
            );
        }

        log.info("Tạo giao dịch thành công ID: {} cho ví ID: {}", savedTransaction.getId(), wallet.getId());
        return transactionMapper.toDTO(savedTransaction);
    }

    @Override
    public Page<TransactionDTO> filterTransactions(Long userId, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate, String keyword, Pageable pageable) {
        return transactionRepository.filterTransactions(userId, walletId, categoryId, startDate, endDate, keyword, pageable)
                .map(transactionMapper::toDTO);
    }

    @Override
    public TransactionDTO getTransactionById(Long id, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndAccessibleByUser(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch hoặc truy cập trái phép!"));
        return transactionMapper.toDTO(transaction);
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

        Double revertAmount = transaction.getType() == Transaction.TransactionType.INCOME
                ? -transaction.getAmount()
                : transaction.getAmount();
        walletRepository.updateBalance(transaction.getWallet().getId(), revertAmount);

        transactionRepository.delete(transaction);
        log.info("Đã xóa giao dịch ID: {} và khôi phục số dư ví ID: {}", id, transaction.getWallet().getId());
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

        Double oldImpact = transaction.getType() == Transaction.TransactionType.INCOME
                ? transaction.getAmount()
                : -transaction.getAmount();

        Double newImpact = request.getType() == Transaction.TransactionType.INCOME
                ? request.getAmount()
                : -request.getAmount();

        Double netChange = newImpact - oldImpact;

        if (netChange != 0.0) {
            walletRepository.updateBalance(transaction.getWallet().getId(), netChange);
        }

        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());

        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.checkAndAlertBudget(
                    userId,
                    request.getCategoryId(),
                    request.getDate().getMonthValue(),
                    request.getDate().getYear()
            );
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Cập nhật thành công giao dịch ID: {} bởi UserId: {}", id, userId);

        return transactionMapper.toDTO(updatedTransaction);
    }
}