package com.personal.finance.backend.importBatch.service;

import com.personal.finance.backend.ai_assistant.service.AiAssistantService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import com.personal.finance.backend.importBatch.entity.ImportBatch;
import com.personal.finance.backend.importBatch.mapper.ImportBatchMapper;
import com.personal.finance.backend.importBatch.repository.ImportBatchRepository;
import com.personal.finance.backend.importBatch.service.impl.ImportBatchServiceImpl;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImportBatchServiceImplTest {

    @Mock private ImportBatchRepository importBatchRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private CategoryRuleRepository categoryRuleRepository;
    @Mock private UserRepository userRepository;
    @Mock private ImportBatchMapper importBatchMapper;
    @Mock private AiAssistantService aiAssistantService;

    @InjectMocks
    private ImportBatchServiceImpl importBatchService;

    private User mockUser;
    private Wallet mockWallet;
    private Category mockCategoryFood;
    private Category mockCategoryUncat;
    private CategoryRule mockRule;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);

        mockWallet = new Wallet();
        mockWallet.setId(10L);
        mockWallet.setName("Ví Test");

        mockCategoryFood = new Category();
        mockCategoryFood.setId(100L);
        mockCategoryFood.setName("Ăn uống");

        mockCategoryUncat = new Category();
        mockCategoryUncat.setId(99L);
        mockCategoryUncat.setName("Chưa phân loại");

        mockRule = new CategoryRule();
        mockRule.setKeyword("Highlands");
        mockRule.setCategory(mockCategoryFood);
    }

    @Test
    void extractHeaders_Csv_Success() {
        String csvData = "Ngày,Số tiền,Nội dung\n2026-08-15,-50000,Highlands Coffee";
        // Bắt buộc thêm StandardCharsets.UTF_8 để mock file không bị lỗi font
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        List<String> headers = importBatchService.extractHeaders(file);

        assertEquals(3, headers.size());
        assertEquals("Ngày", headers.get(0));
        assertEquals("Số tiền", headers.get(1));
        assertEquals("Nội dung", headers.get(2));
    }

    @Test
    void importData_NoEditPermission_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "data".getBytes(StandardCharsets.UTF_8));

        when(walletRepository.hasEditPermission(10L, 1L)).thenReturn(false);

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            importBatchService.importData(1L, 10L, 0, 1, 2, file);
        });

        assertEquals("Bạn không có quyền import dữ liệu vào ví này!", exception.getMessage());
        verify(importBatchRepository, never()).save(any());
    }

    @Test
    void importData_ValidFile_MatchedByRule_NoAiCall() {
        String csvData = "Ngày,Số tiền,Ghi chú\n2026-08-15,-50000,Highlands Coffee";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        when(walletRepository.hasEditPermission(10L, 1L)).thenReturn(true);
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(importBatchRepository.save(any())).thenReturn(new ImportBatch());
        when(categoryRepository.findByNameAndUserId("Chưa phân loại", 1L)).thenReturn(Optional.of(mockCategoryUncat));
        when(categoryRuleRepository.findAllByUserIdOrderByPriorityDesc(1L)).thenReturn(List.of(mockRule));

        when(transactionRepository.existsByWalletIdAndDateAndAmountAndDescription(eq(10L), any(), eq(50000.0), eq("Highlands Coffee"))).thenReturn(false);

        ImportBatchDTO mockResponseDTO = new ImportBatchDTO();
        mockResponseDTO.setSuccessRows(1);
        when(importBatchMapper.toDTO(any())).thenReturn(mockResponseDTO);

        ImportBatchDTO result = importBatchService.importData(1L, 10L, 0, 1, 2, file);

        assertNotNull(result);
        assertEquals(1, result.getSuccessRows());
        verify(transactionRepository, times(1)).saveAll(anyList());
        verify(aiAssistantService, never()).categorizeTransactionsBatch(anyList(), anyList());
    }

    @Test
    void importData_DuplicateData_SkipsRow() {
        String csvData = "Ngày,Số tiền,Ghi chú\n2026-08-15,-50000,Highlands Coffee";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        when(walletRepository.hasEditPermission(10L, 1L)).thenReturn(true);
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(importBatchRepository.save(any())).thenReturn(new ImportBatch());
        when(categoryRepository.findByNameAndUserId("Chưa phân loại", 1L)).thenReturn(Optional.of(mockCategoryUncat));

        when(transactionRepository.existsByWalletIdAndDateAndAmountAndDescription(eq(10L), any(), eq(50000.0), eq("Highlands Coffee"))).thenReturn(true);

        ImportBatchDTO mockResponseDTO = new ImportBatchDTO();
        mockResponseDTO.setDuplicatedRows(1);
        when(importBatchMapper.toDTO(any())).thenReturn(mockResponseDTO);

        ImportBatchDTO result = importBatchService.importData(1L, 10L, 0, 1, 2, file);

        assertNotNull(result);
        assertEquals(1, result.getDuplicatedRows());
        verify(transactionRepository, never()).saveAll(anyList());
    }

    @Test
    void importData_InvalidFormat_ThrowsExceptionAndRollback() {
        String csvData = "Ngày,Số tiền,Ghi chú\nABC,-50000,Lỗi format";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        when(walletRepository.hasEditPermission(10L, 1L)).thenReturn(true);
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(importBatchRepository.save(any())).thenReturn(new ImportBatch());
        when(categoryRepository.findByNameAndUserId("Chưa phân loại", 1L)).thenReturn(Optional.of(mockCategoryUncat));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            importBatchService.importData(1L, 10L, 0, 1, 2, file);
        });

        assertTrue(exception.getMessage().contains("Lỗi định dạng file hoặc dữ liệu không hợp lệ"));
        verify(transactionRepository, never()).saveAll(anyList());
    }
}