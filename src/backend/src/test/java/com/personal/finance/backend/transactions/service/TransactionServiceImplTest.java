package com.personal.finance.backend.transactions.service;

import com.personal.finance.backend.budgets.service.BudgetService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.transactions.dto.request.CreateTransactionRequest;
import com.personal.finance.backend.transactions.dto.request.UpdateTransactionRequest;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.mapper.TransactionMapper;
import com.personal.finance.backend.transactions.repository.TransactionHistoryRepository;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.transactions.service.impl.TransactionServiceImpl;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @Mock
    private BudgetService budgetService;

    @Mock
    private TransactionHistoryRepository transactionHistoryRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private CreateTransactionRequest request;
    private Wallet mockWallet;
    private Category mockCategory;
    private Transaction mockTransaction;

    @BeforeEach
    void setUp() {
        request = new CreateTransactionRequest();
        request.setWalletId(1L);
        request.setCategoryId(2L);
        request.setAmount(BigDecimal.valueOf(50000.0));
        request.setType(Transaction.TransactionType.EXPENSE);
        request.setDate(LocalDate.now());
        request.setDescription("Ăn sáng");

        mockWallet = new Wallet();
        mockWallet.setId(1L);

        mockCategory = new Category();
        mockCategory.setId(2L);

        mockTransaction = new Transaction();
        mockTransaction.setId(100L);
        mockTransaction.setWallet(mockWallet);
        mockTransaction.setAmount(BigDecimal.valueOf(50000.0));
        mockTransaction.setType(Transaction.TransactionType.EXPENSE);
    }


    @Test
    void createTransaction_HasEditPermission_Success() {
        Long userId = 10L;

        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(true);
        when(walletRepository.findById(1L)).thenReturn(Optional.of(mockWallet));
        when(categoryRepository.findByIdAndAccessibleByUser(2L, userId)).thenReturn(Optional.of(mockCategory));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(mockTransaction);
        when(transactionMapper.toDTO(any())).thenReturn(new TransactionDTO());

        TransactionDTO result = transactionService.createTransaction(userId, request);

        assertNotNull(result);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(walletRepository, times(1)).updateBalance(eq(1L), BigDecimal.valueOf(ArgumentMatchers.eq(-50000.0)));
    }

    @Test
    void createTransaction_ViewPermissionOnly_ThrowsAccessDeniedException() {
        Long userId = 11L;
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(false);

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            transactionService.createTransaction(userId, request);
        });

        assertEquals("Bạn không có quyền thêm giao dịch vào ví này!", exception.getMessage());
        verify(transactionRepository, never()).save(any());
        verify(walletRepository, never()).updateBalance(anyLong(), anyDouble());
    }


    @Test
    void deleteTransaction_HasEditPermission_SuccessAndRevertBalance() {
        Long userId = 10L;
        Long transactionId = 100L;

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(true);

        transactionService.deleteTransaction(transactionId, userId);

        verify(transactionRepository, times(1)).delete(mockTransaction);
        verify(walletRepository, times(1)).updateBalance(eq(1L), eq(50000.0));
    }

    @Test
    void deleteTransaction_InaccessibleTransaction_ThrowsException() {
        Long hackerId = 99L;
        Long transactionId = 100L;

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, hackerId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            transactionService.deleteTransaction(transactionId, hackerId);
        });

        assertEquals("Không tìm thấy giao dịch hoặc truy cập trái phép!", exception.getMessage());
        verify(transactionRepository, never()).delete(any());
        verify(walletRepository, never()).updateBalance(anyLong(), anyDouble());
    }


    @Test
    void updateTransaction_HasEditPermission_UpdateAmountExpense_Success() {
        Long userId = 10L;
        Long transactionId = 100L;

        UpdateTransactionRequest updateReq = new UpdateTransactionRequest();
        updateReq.setCategoryId(2L);
        updateReq.setAmount(70000.0);
        updateReq.setType(Transaction.TransactionType.EXPENSE);
        updateReq.setDate(LocalDate.now());
        updateReq.setDescription("Ăn trưa xịn hơn");

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(true);
        when(categoryRepository.findByIdAndAccessibleByUser(2L, userId)).thenReturn(Optional.of(mockCategory));

        when(transactionRepository.save(any(Transaction.class))).thenReturn(mockTransaction);
        when(transactionMapper.toDTO(any())).thenReturn(new TransactionDTO());

        TransactionDTO result = transactionService.updateTransaction(transactionId, userId, updateReq);

        assertNotNull(result);
        verify(transactionRepository, times(1)).save(mockTransaction);
        verify(walletRepository, times(1)).updateBalance(eq(1L), eq(-20000.0));
    }

    @Test
    void updateTransaction_HasEditPermission_ChangeToIncome_Success() {
        Long userId = 10L;
        Long transactionId = 100L;

        UpdateTransactionRequest updateReq = new UpdateTransactionRequest();
        updateReq.setCategoryId(2L);
        updateReq.setAmount(100000.0);
        updateReq.setType(Transaction.TransactionType.INCOME);
        updateReq.setDate(LocalDate.now());

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(true);
        // ĐÃ SỬA THÀNH findByIdAndAccessibleByUser
        when(categoryRepository.findByIdAndAccessibleByUser(2L, userId)).thenReturn(Optional.of(mockCategory));

        when(transactionRepository.save(any(Transaction.class))).thenReturn(mockTransaction);
        when(transactionMapper.toDTO(any())).thenReturn(new TransactionDTO());

        transactionService.updateTransaction(transactionId, userId, updateReq);

        verify(transactionRepository, times(1)).save(mockTransaction);
        verify(walletRepository, times(1)).updateBalance(eq(1L), eq(150000.0));
    }

    @Test
    void updateTransaction_ViewPermissionOnly_ThrowsException() {
        Long userId = 11L;
        Long transactionId = 100L;
        UpdateTransactionRequest updateReq = new UpdateTransactionRequest();

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(false);

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            transactionService.updateTransaction(transactionId, userId, updateReq);
        });

        assertEquals("Bạn không có quyền sửa giao dịch trong ví này!", exception.getMessage());

        verify(transactionRepository, never()).save(any());
        verify(walletRepository, never()).updateBalance(anyLong(), anyDouble());
    }

    @Test
    void deleteTransaction_ViewPermissionOnly_ThrowsException() {
        Long userId = 11L;
        Long transactionId = 100L;

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(false);

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            transactionService.deleteTransaction(transactionId, userId);
        });

        assertEquals("Bạn không có quyền xóa giao dịch trong ví này!", exception.getMessage());
        verify(transactionRepository, never()).delete(any());
    }

    @Test
    void createTransaction_ExpenseType_TriggersBudgetCheck() {
        Long userId = 10L;
        request.setType(Transaction.TransactionType.EXPENSE);

        when(walletRepository.hasEditPermission(1L, userId)).thenReturn(true);
        when(walletRepository.findById(1L)).thenReturn(Optional.of(mockWallet));
        when(categoryRepository.findByIdAndAccessibleByUser(2L, userId)).thenReturn(Optional.of(mockCategory));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(mockTransaction);
        when(transactionMapper.toDTO(any())).thenReturn(new TransactionDTO());

        transactionService.createTransaction(userId, request);

        verify(budgetService, times(1)).checkAndAlertBudget(eq(userId), eq(2L), anyInt(), anyInt());
    }

    @Test
    void getTransactionById_Success() {
        Long userId = 10L;
        Long transactionId = 100L;

        when(transactionRepository.findByIdAndAccessibleByUser(transactionId, userId)).thenReturn(Optional.of(mockTransaction));
        when(transactionMapper.toDTO(mockTransaction)).thenReturn(new TransactionDTO());

        TransactionDTO result = transactionService.getTransactionById(transactionId, userId);

        assertNotNull(result);
        verify(transactionRepository, times(1)).findByIdAndAccessibleByUser(transactionId, userId);
    }
}