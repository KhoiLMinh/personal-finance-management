package com.personal.finance.backend.backup.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.personal.finance.backend.backup.dto.BackupDataDTO;
import com.personal.finance.backend.budgets.mapper.BudgetMapper;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.categories.mapper.CategoryMapper;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.savingGoals.mapper.SavingGoalMapper;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.transactions.mapper.TransactionMapper;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.mapper.WalletMapper;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataBackupServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private SavingGoalRepository savingGoalRepository;

    @Mock private WalletMapper walletMapper;
    @Mock private CategoryMapper categoryMapper;
    @Mock private TransactionMapper transactionMapper;
    @Mock private BudgetMapper budgetMapper;
    @Mock private SavingGoalMapper savingGoalMapper;

    @InjectMocks
    private DataBackupServiceImpl backupService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
    }

    @Test
    void exportUserData_Success_ReturnsByteArray() {
        Long userId = 1L;
        when(walletRepository.findAllWalletAccessByUser(userId)).thenReturn(List.of());
        when(categoryRepository.findAllByUserIdOrderByCreateAtDesc(userId)).thenReturn(List.of());

        when(transactionRepository.filterTransactions(
                eq(userId), any(), any(), any(), any(), any(), any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        when(budgetRepository.findAllByUserId(eq(userId), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(savingGoalRepository.findAllByUserId(eq(userId), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        byte[] result = backupService.exportUserData(userId);

        assertNotNull(result);
        assertTrue(result.length > 0);
        String jsonStr = new String(result);
        assertTrue(jsonStr.contains("exportDate"));
    }

    @Test
    void importUserData_InvalidFormat_ThrowsException() {
        MultipartFile file = new MockMultipartFile("file", "test.json", "application/json", "invalid-json-data".getBytes());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            backupService.importUserData(1L, file);
        });

        assertEquals("File sao lưu không hợp lệ hoặc bị hỏng dữ liệu!", exception.getMessage());
    }

    @Test
    void importUserData_ValidFile_Success() throws Exception {
        BackupDataDTO backupData = new BackupDataDTO();
        WalletDTO wDto = new WalletDTO();
        wDto.setId(10L);
        wDto.setName("Ví Test");
        wDto.setBalance(BigDecimal.ZERO);
        backupData.setWallets(List.of(wDto));

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        byte[] jsonBytes = mapper.writeValueAsBytes(backupData);

        MultipartFile file = new MockMultipartFile("file", "test.json", "application/json", jsonBytes);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(walletRepository.findAllWalletAccessByUser(1L)).thenReturn(List.of());

        Wallet mockSavedWallet = new Wallet();
        mockSavedWallet.setId(10L);
        when(walletRepository.save(any(Wallet.class))).thenReturn(mockSavedWallet);

        assertDoesNotThrow(() -> backupService.importUserData(1L, file));

        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    void importUserData_NewSavingGoal_RestoredWithoutError() throws Exception {
        BackupDataDTO backupData = new BackupDataDTO();
        com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO g = new com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO();
        g.setTitle("Mua xe");
        g.setTargetAmount(new BigDecimal("1000000"));
        g.setCurrentAmount(BigDecimal.ZERO);
        g.setDeadline(java.time.LocalDate.of(2027, 1, 1));
        g.setStatus("IN_PROGRESS");
        backupData.setSavingGoals(List.of(g));
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        MultipartFile file = new MockMultipartFile("file", "b.json", "application/json", mapper.writeValueAsBytes(backupData));

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(savingGoalRepository.findAllByUserId(eq(1L), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(savingGoalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Page.getContent() is unmodifiable; restore used to fail with "File sao lưu không hợp lệ"
        assertDoesNotThrow(() -> backupService.importUserData(1L, file));
        verify(savingGoalRepository, times(1)).save(any());
    }

    @Test
    void importUserData_SameNameWalletOnlySharedWithUser_NotReused() throws Exception {
        BackupDataDTO backupData = new BackupDataDTO();
        WalletDTO wDto = new WalletDTO();
        wDto.setId(10L);
        wDto.setName("Ví chung");
        wDto.setBalance(BigDecimal.ZERO);
        backupData.setWallets(List.of(wDto));
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        MultipartFile file = new MockMultipartFile("file", "b.json", "application/json", mapper.writeValueAsBytes(backupData));

        User otherOwner = new User();
        otherOwner.setId(2L);
        Wallet shared = new Wallet();
        shared.setId(50L);
        shared.setName("Ví chung");
        shared.setOwner(otherOwner);
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(walletRepository.findAllWalletAccessByUser(1L)).thenReturn(List.of(shared));
        Wallet created = new Wallet();
        created.setId(60L);
        when(walletRepository.save(any(Wallet.class))).thenReturn(created);

        backupService.importUserData(1L, file);

        // a new wallet owned by the user is created instead of writing into user 2's wallet
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }
}
