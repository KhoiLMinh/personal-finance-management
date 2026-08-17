package com.personal.finance.backend.categories.service;

import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.categories.dto.request.CreateCategoryRequest;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.mapper.CategoryMapper;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.categories.service.impl.CategoryServiceImpl;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRuleRepository categoryRuleRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private User mockUser;
    private Category mockCategory;
    private CategoryDTO mockCategoryDTO;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        mockCategory = new Category();
        mockCategory.setId(10L);
        mockCategory.setName("Ăn uống");
        mockCategory.setType(Category.CategoryType.EXPENSE);
        mockCategory.setUser(mockUser);

        mockCategory.setTransactions(new ArrayList<>());
        mockCategory.setBudgets(new ArrayList<>());

        mockCategoryDTO = new CategoryDTO();
        mockCategoryDTO.setId(10L);
        mockCategoryDTO.setName("Ăn uống");
        mockCategoryDTO.setType(Category.CategoryType.EXPENSE);
    }

    @Test
    void createCategory_ValidRequest_Success() {

        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Lương");
        request.setType(Category.CategoryType.INCOME);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(categoryRepository.save(any(Category.class))).thenReturn(mockCategory);
        when(categoryMapper.toDTO(any(Category.class))).thenReturn(mockCategoryDTO);


        CategoryDTO result = categoryService.createCategory(1L, request);

        assertNotNull(result);
        verify(categoryRepository, times(1)).save(any(Category.class));
    }


    @Test
    void createCategory_ParentTypeMismatch_ThrowsException() {

        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Tiền thưởng");
        request.setType(Category.CategoryType.INCOME);
        request.setParentId(10L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockCategory));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            categoryService.createCategory(1L, request);
        });

        assertEquals("Danh mục con phải cùng loại với danh mục cha!", exception.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }


    @Test
    void deleteCategory_NoTransactionsOrBudgets_Success() {

        Long userId = 1L;
        Long categoryId = 10L;
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(mockCategory));


        categoryService.deleteCategory(categoryId, userId);


        verify(categoryRepository, times(1)).delete(mockCategory);
    }


    @Test
    void deleteCategory_HasTransactions_ThrowsException() {

        Long userId = 1L;
        Long categoryId = 10L;

        mockCategory.getTransactions().add(new Transaction());

        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(mockCategory));


        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            categoryService.deleteCategory(categoryId, userId);
        });

        assertEquals("Danh mục đã có giao dịch hoặc ngân sách liên quan, không thể xoá. Hãy ẩn danh mục thay vì xoá!", exception.getMessage());
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void hideCategory_ValidRequest_Success() {
        Long userId = 1L;
        Long categoryId = 10L;
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(mockCategory));

        categoryService.hideCategory(categoryId, userId);

        assertTrue(mockCategory.isHidden());
        verify(categoryRepository, times(1)).save(mockCategory);
    }


    @Test
    void getCategoryById_NoAccess_ThrowsException() {
        Long hackerId = 99L;
        Long categoryId = 10L;
        when(categoryRepository.findByIdAndUserId(categoryId, hackerId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            categoryService.getCategoryById(categoryId, hackerId);
        });

        assertEquals("Không tìm thấy danh mục!", exception.getMessage());
    }

    @Test
    void addRule_ValidRequest_Success() {
        com.personal.finance.backend.categories.dto.request.CreateCategoryRuleRequest request =
                new com.personal.finance.backend.categories.dto.request.CreateCategoryRuleRequest();
        request.setKeyword("Highlands");
        request.setPriority(1);

        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRuleRepository.save(any(com.personal.finance.backend.categories.entity.CategoryRule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        com.personal.finance.backend.categories.dto.response.CategoryRuleDTO ruleDTO =
                new com.personal.finance.backend.categories.dto.response.CategoryRuleDTO();
        ruleDTO.setKeyword("Highlands");
        when(categoryMapper.toDTO(any(com.personal.finance.backend.categories.entity.CategoryRule.class))).thenReturn(ruleDTO);


        com.personal.finance.backend.categories.dto.response.CategoryRuleDTO result = categoryService.addRule(10L, 1L, request);


        assertNotNull(result);
        assertEquals("Highlands", result.getKeyword());
        verify(categoryRuleRepository, times(1)).save(any());
    }

    @Test
    void deleteRule_NotOwnerOfCategory_ThrowsException() {
        when(categoryRepository.findByIdAndUserId(10L, 99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            categoryService.deleteRule(10L, 1L, 99L);
        });

        assertEquals("Không tìm thấy danh mục!", exception.getMessage());
        verify(categoryRuleRepository, never()).delete(any());
    }
}