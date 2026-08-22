package com.personal.finance.backend.budgets.service.impl;

import com.personal.finance.backend.budgets.dto.request.CreateBudgetRequest;
import com.personal.finance.backend.budgets.dto.request.UpdateBudgetRequest;
import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.budgets.mapper.BudgetMapper;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceImplTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BudgetMapper budgetMapper;

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private User mockUser;
    private Category mockCategory;
    private Budget mockBudget;
    private BudgetDTO mockBudgetDTO;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@gmail.com");

        mockCategory = new Category();
        mockCategory.setId(10L);
        mockCategory.setName("Ăn uống");

        mockBudget = new Budget();
        mockBudget.setId(100L);
        mockBudget.setUser(mockUser);
        mockBudget.setCategory(mockCategory);
        mockBudget.setMonth(8);
        mockBudget.setYear(2026);
        mockBudget.setLimitAmount(5000000.0);
        mockBudget.setWarningPercent(80.0); 
        mockBudget.setStatus(Budget.BudgetStatus.ACTIVE);
        mockBudget.setWarningSent(false);

        mockBudgetDTO = new BudgetDTO();
        mockBudgetDTO.setId(100L);
        mockBudgetDTO.setLimitAmount(5000000.0);
    }

    @Test
    void createBudget_ValidRequest_Success() {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setCategoryId(10L);
        request.setMonth(8);
        request.setYear(2026);
        request.setLimitAmount(5000000.0);
        request.setWarningPercent(80.0);

        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(1L, 10L, 8, 2026)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(categoryRepository.findByIdAndAccessibleByUser(10L, 1L)).thenReturn(Optional.of(mockCategory));
        when(budgetRepository.save(any(Budget.class))).thenReturn(mockBudget);
        when(budgetMapper.toDTO(any(Budget.class))).thenReturn(mockBudgetDTO);

        BudgetDTO result = budgetService.createBudget(1L, request);

        assertNotNull(result);
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void createBudget_DuplicateBudget_ThrowsException() {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setCategoryId(10L);
        request.setMonth(8);
        request.setYear(2026);

        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(1L, 10L, 8, 2026)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> budgetService.createBudget(1L, request));
        assertTrue(exception.getMessage().contains("Bạn đã thiết lập ngân sách cho danh mục này"));
    }

    @Test
    void getBudgets_ReturnsPageOfBudgets() {
        Page<Budget> budgetPage = new PageImpl<>(List.of(mockBudget));
        when(budgetRepository.findAllByUserId(eq(1L), any(Pageable.class))).thenReturn(budgetPage);
        when(budgetMapper.toDTO(mockBudget)).thenReturn(mockBudgetDTO);

        Page<BudgetDTO> result = budgetService.getBudgets(1L, Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void getBudgetById_HasAccess_Success() {
        when(budgetRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockBudget));
        when(budgetMapper.toDTO(mockBudget)).thenReturn(mockBudgetDTO);

        BudgetDTO result = budgetService.getBudgetById(100L, 1L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
    }

    @Test
    void getBudgetById_NotOwner_ThrowsException() {
        when(budgetRepository.findByIdAndUserId(100L, 99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> budgetService.getBudgetById(100L, 99L));
        assertEquals("Không tìm thấy ngân sách hoặc bạn không có quyền truy cập!", exception.getMessage());
    }

    @Test
    void updateBudget_ValidRequest_Success() {
        UpdateBudgetRequest request = new UpdateBudgetRequest();
        request.setLimitAmount(6000000.0);
        request.setWarningPercent(90.0);

        when(budgetRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockBudget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(mockBudget);
        
        BudgetDTO updatedDTO = new BudgetDTO();
        updatedDTO.setLimitAmount(6000000.0);
        when(budgetMapper.toDTO(any(Budget.class))).thenReturn(updatedDTO);

        BudgetDTO result = budgetService.updateBudget(100L, 1L, request);

        assertEquals(6000000.0, mockBudget.getLimitAmount()); 
        assertEquals(90.0, mockBudget.getWarningPercent()); 
        verify(budgetRepository, times(1)).save(mockBudget);
    }

    @Test
    void deleteBudget_IsOwner_Success() {
        when(budgetRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockBudget));

        budgetService.deleteBudget(100L, 1L);

        verify(budgetRepository, times(1)).delete(mockBudget);
    }

    @Test
    void checkAndAlertBudget_ExceedLimit_UpdatesStatusAndSendsAlert() {

        Page<Budget> budgetPage = new PageImpl<>(List.of(mockBudget));
        when(budgetRepository.findAllByUserId(eq(1L), any(Pageable.class))).thenReturn(budgetPage);


        when(transactionRepository.sumExpenseByCategoryAndMonth(eq(10L), eq(1L), eq(8), eq(2026), eq(Transaction.TransactionType.EXPENSE))).thenReturn(5500000.0);

        budgetService.checkAndAlertBudget(1L, 10L, 8, 2026);


        assertEquals(Budget.BudgetStatus.EXCEED, mockBudget.getStatus());
        verify(budgetRepository, times(1)).save(mockBudget);
        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString());
        verify(emailService, times(1)).sendEmail(eq("test@gmail.com"), anyString(), anyString());
    }

    @Test
    void checkAndAlertBudget_ReachWarningLimit_SendsWarningOnce() {

        Page<Budget> budgetPage = new PageImpl<>(List.of(mockBudget));
        when(budgetRepository.findAllByUserId(eq(1L), any(Pageable.class))).thenReturn(budgetPage);

        when(transactionRepository.sumExpenseByCategoryAndMonth(eq(10L), eq(1L), eq(8), eq(2026), eq(Transaction.TransactionType.EXPENSE))).thenReturn(4500000.0);


        budgetService.checkAndAlertBudget(1L, 10L, 8, 2026);


        assertTrue(mockBudget.isWarningSent()); 
        assertEquals(Budget.BudgetStatus.ACTIVE, mockBudget.getStatus()); 
        verify(budgetRepository, times(1)).save(mockBudget);
        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString());
        verify(emailService, times(1)).sendEmail(eq("test@gmail.com"), anyString(), anyString());
    }

    @Test
    void checkAndAlertBudget_BelowWarningLimit_DoesNothing() {

        Page<Budget> budgetPage = new PageImpl<>(List.of(mockBudget));
        when(budgetRepository.findAllByUserId(eq(1L), any(Pageable.class))).thenReturn(budgetPage);


        when(transactionRepository.sumExpenseByCategoryAndMonth(eq(10L), eq(1L), eq(8), eq(2026), eq(Transaction.TransactionType.EXPENSE))).thenReturn(2000000.0);


        budgetService.checkAndAlertBudget(1L, 10L, 8, 2026);

        assertFalse(mockBudget.isWarningSent()); 
        verify(budgetRepository, never()).save(any()); 
        verify(notificationService, never()).createSystemNotification(anyLong(), anyString(), anyString());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }
}