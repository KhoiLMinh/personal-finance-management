package com.personal.finance.backend.savingGoals.service;

import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.savingGoals.dto.request.AddFundRequest;
import com.personal.finance.backend.savingGoals.dto.request.CreateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.request.UpdateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.mapper.SavingGoalMapper;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.savingGoals.service.impl.SavingGoalServiceImpl;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavingGoalServiceImplTest {

    @Mock
    private SavingGoalRepository savingGoalRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SavingGoalMapper savingGoalMapper;
    @Mock
    private WalletRepository walletRepository;
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private SavingGoalServiceImpl savingGoalService;

    private User mockUser;
    private SavingGoal mockGoal;
    private Wallet mockWallet;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);

        mockGoal = new SavingGoal();
        mockGoal.setId(10L);
        mockGoal.setTitle("Mua Laptop mới");
        mockGoal.setTargetAmount(BigDecimal.valueOf(20000000.0));
        mockGoal.setCurrentAmount(BigDecimal.valueOf(5000000.0));
        mockGoal.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        mockGoal.setUser(mockUser);

        mockWallet = new Wallet();
        mockWallet.setId(100L);
        mockWallet.setName("Ví tiền mặt");
        mockWallet.setBalance(BigDecimal.valueOf(15000000.0));
    }

    @Test
    void createSavingGoal_Success() {
        CreateSavingGoalRequest request = new CreateSavingGoalRequest();
        request.setTitle("Du lịch");
        request.setTargetAmount(BigDecimal.valueOf(10000000.0));
        request.setDeadline(LocalDate.now().plusMonths(6));

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(savingGoalRepository.save(any(SavingGoal.class))).thenReturn(mockGoal);
        when(savingGoalMapper.toDTO(any())).thenReturn(new SavingGoalDTO());

        SavingGoalDTO result = savingGoalService.createSavingGoal(1L, request);

        assertNotNull(result);
        verify(savingGoalRepository, times(1)).save(any(SavingGoal.class));
    }

    @Test
    void getSavingGoalById_NotOwner_ThrowsException() {
        when(savingGoalRepository.findByIdAndUserId(10L, 99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savingGoalService.getSavingGoalById(10L, 99L);
        });

        assertEquals("Không tìm thấy mục tiêu tiết kiệm hoặc bạn không có quyền truy cập!", exception.getMessage());
    }

    @Test
    void updateSavingGoal_ReachTarget_ChangesStatusToComplete() {
        UpdateSavingGoalRequest request = new UpdateSavingGoalRequest();
        request.setTitle("Mua Laptop mới");
        request.setTargetAmount(BigDecimal.valueOf(4000000.0));
        request.setDeadline(LocalDate.now().plusMonths(1));

        when(savingGoalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockGoal));
        when(savingGoalRepository.save(any(SavingGoal.class))).thenReturn(mockGoal);

        savingGoalService.updateSavingGoal(10L, 1L, request);

        assertEquals(SavingGoal.GoalStatus.COMPLETE, mockGoal.getStatus());
        verify(savingGoalRepository, times(1)).save(mockGoal);
    }

    @Test
    void addFunds_Success_UpdatesWalletAndCreatesTransaction() {
        AddFundRequest request = new AddFundRequest();
        request.setAmount(BigDecimal.valueOf(3000000.0));
        request.setWalletId(100L);

        when(walletRepository.hasEditPermission(100L, 1L)).thenReturn(true);
        when(walletRepository.findById(100L)).thenReturn(Optional.of(mockWallet));
        when(savingGoalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockGoal));
        when(savingGoalRepository.addFundsToGoal(10L, 1L, BigDecimal.valueOf(3000000.0))).thenReturn(1);

        Category mockCategory = new Category();
        mockCategory.setId(1L);
        mockCategory.setName("Chuyển tiền tiết kiệm");
        when(categoryRepository.findByNameAndUserId("Chuyển tiền tiết kiệm", 1L)).thenReturn(Optional.of(mockCategory));

        when(savingGoalMapper.toDTO(any())).thenReturn(new SavingGoalDTO());

        savingGoalService.addFunds(10L, 1L, request);
        verify(walletRepository, times(1)).updateBalance(100L, BigDecimal.valueOf(3000000.0).negate());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(savingGoalRepository, times(1)).addFundsToGoal(10L, 1L, BigDecimal.valueOf(3000000.0));

        assertEquals(SavingGoal.GoalStatus.IN_PROGRESS, mockGoal.getStatus());
    }

    @Test
    void addFunds_InsufficientWalletBalance_ThrowsException() {
        AddFundRequest request = new AddFundRequest();
        request.setAmount(BigDecimal.valueOf(20000000.0));
        request.setWalletId(100L);

        when(walletRepository.hasEditPermission(100L, 1L)).thenReturn(true);
        when(walletRepository.findById(100L)).thenReturn(Optional.of(mockWallet));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savingGoalService.addFunds(10L, 1L, request);
        });

        assertEquals("Số dư trong ví không đủ để trích vào mục tiêu tiết kiệm!", exception.getMessage());
        verify(walletRepository, never()).updateBalance(anyLong(), any(BigDecimal.class));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void addFunds_NoEditPermissionOnWallet_ThrowsException() {
        AddFundRequest request = new AddFundRequest();
        request.setAmount(BigDecimal.valueOf(1000000.0));
        request.setWalletId(100L);

        when(walletRepository.hasEditPermission(100L, 1L)).thenReturn(false); // Bị từ chối quyền

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savingGoalService.addFunds(10L, 1L, request);
        });

        assertEquals("Bạn không có quyền trích tiền từ ví này!", exception.getMessage());
    }

    @Test
    void addFunds_GoalAlreadyCompleted_ThrowsException() {
        mockGoal.setStatus(SavingGoal.GoalStatus.COMPLETE);

        AddFundRequest request = new AddFundRequest();
        request.setAmount(BigDecimal.valueOf(1000000.0));
        request.setWalletId(100L);

        when(walletRepository.hasEditPermission(100L, 1L)).thenReturn(true);
        when(walletRepository.findById(100L)).thenReturn(Optional.of(mockWallet));
        when(savingGoalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockGoal));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savingGoalService.addFunds(10L, 1L, request);
        });

        assertEquals("Mục tiêu này đã hoàn thành, không thể nộp thêm tiền!", exception.getMessage());
    }

    @Test
    void addFunds_ReachesTarget_ChangesStatusToComplete() {
        AddFundRequest request = new AddFundRequest();
        request.setAmount(BigDecimal.valueOf(15000000.0));
        request.setWalletId(100L);

        when(walletRepository.hasEditPermission(100L, 1L)).thenReturn(true);
        when(walletRepository.findById(100L)).thenReturn(Optional.of(mockWallet));
        when(savingGoalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockGoal));
        when(savingGoalRepository.addFundsToGoal(10L, 1L, BigDecimal.valueOf(15000000.0))).thenReturn(1);

        Category mockCategory = new Category();
        mockCategory.setId(1L);
        mockCategory.setName("Chuyển tiền tiết kiệm");

        when(categoryRepository.findByNameAndUserId("Chuyển tiền tiết kiệm", 1L)).thenReturn(Optional.of(mockCategory));

        savingGoalService.addFunds(10L, 1L, request);

        assertEquals(SavingGoal.GoalStatus.COMPLETE, mockGoal.getStatus());
        verify(savingGoalRepository, times(1)).save(mockGoal);
    }
}