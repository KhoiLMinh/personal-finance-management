package com.personal.finance.backend.reports.service.impl;

import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate prevStartDate;
    private LocalDate prevEndDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2026, 8, 1);
        endDate = LocalDate.of(2026, 8, 31);
        prevStartDate = LocalDate.of(2026, 7, 1);
        prevEndDate = LocalDate.of(2026, 7, 31);
    }

    @Test
    void getDashboardOverview_Success_CalculatesCorrectly() {
        Long userId = 1L;

        when(walletRepository.getTotalBalanceAccessibleByUser(userId)).thenReturn(BigDecimal.valueOf(50000000.0));
        when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, startDate, endDate)).thenReturn(BigDecimal.valueOf(20000000.0));
        when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, startDate, endDate)).thenReturn(BigDecimal.valueOf(10000000.0));

        lenient().when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, prevStartDate, prevEndDate)).thenReturn(BigDecimal.valueOf(10000000.0));
        lenient().when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, prevStartDate, prevEndDate)).thenReturn(BigDecimal.valueOf(12500000.0));

        List<CategoryExpenseDTO> pieChartData = List.of(new CategoryExpenseDTO(1L, "Ăn uống", "#ff0000", BigDecimal.valueOf(5000000.0)));
        when(transactionRepository.getExpenseByCategory(userId, startDate, endDate)).thenReturn(pieChartData);

        List<Object[]> lineChartRawData = new ArrayList<>();
        lineChartRawData.add(new Object[]{"2026-08-15", Transaction.TransactionType.INCOME, BigDecimal.valueOf(500000.0)});
        lineChartRawData.add(new Object[]{"2026-08-15", Transaction.TransactionType.EXPENSE, BigDecimal.valueOf(200000.0)});
        when(transactionRepository.getTrendData(userId, startDate, endDate)).thenReturn(lineChartRawData);

        DashboardOverviewDTO result = reportService.getDashboardOverview(userId, startDate, endDate, anyString());

        assertNotNull(result);
        assertEquals(50000000.0, result.getTotalBalance().doubleValue());
        assertEquals(10000000.0, result.getNetSavings().doubleValue());

        assertEquals(100.0, result.getIncomeChangePercent());
        assertEquals(-20.0, result.getExpenseChangePercent());

        assertEquals(1, result.getExpenseByCategory().size());
        assertEquals(1, result.getTrendData().size());
        assertEquals("2026-08-15", result.getTrendData().get(0).getDate());
        assertEquals(500000.0, result.getTrendData().get(0).getIncome().doubleValue());
        assertEquals(200000.0, result.getTrendData().get(0).getExpense().doubleValue());
    }

    @Test
    void getDashboardOverview_PreviousDataIsNull_Calculates100PercentSafely() {
        Long userId = 1L;

        when(walletRepository.getTotalBalanceAccessibleByUser(userId)).thenReturn(BigDecimal.valueOf(5000000.0));
        when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, startDate, endDate)).thenReturn(BigDecimal.valueOf(5000000.0));

        lenient().when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, startDate, endDate)).thenReturn(BigDecimal.ZERO);
        lenient().when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, prevStartDate, prevEndDate)).thenReturn(null);
        lenient().when(transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, prevStartDate, prevEndDate)).thenReturn(null);
        lenient().when(transactionRepository.getExpenseByCategory(userId, startDate, endDate)).thenReturn(new ArrayList<>());
        lenient().when(transactionRepository.getTrendData(userId, startDate, endDate)).thenReturn(new ArrayList<>());

        DashboardOverviewDTO result = reportService.getDashboardOverview(userId, startDate, endDate, anyString());

        assertEquals(100.0, result.getIncomeChangePercent());
    }

    @Test
    void exportTransactionsToExcel_ReturnsValidByteArray() {
        Long userId = 1L;
        Transaction mockTx = new Transaction();
        mockTx.setDate(LocalDate.now());
        mockTx.setType(Transaction.TransactionType.EXPENSE);
        mockTx.setAmount(BigDecimal.valueOf(50000.0));

        Category cat = new Category(); cat.setName("Test");
        Wallet wal = new Wallet(); wal.setName("Ví Test");
        mockTx.setCategory(cat);
        mockTx.setWallet(wal);

        when(transactionRepository.filterTransactions(eq(userId), isNull(), isNull(), eq(startDate), eq(endDate), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(mockTx)));

        byte[] excelBytes = reportService.exportTransactionsToExcel(userId, null, startDate, endDate);

        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
    }

    @Test
    void exportTransactionsToPdf_ReturnsValidByteArray() {
        Long userId = 1L;
        Transaction mockTx = new Transaction();
        mockTx.setDate(LocalDate.now());
        mockTx.setType(Transaction.TransactionType.EXPENSE);
        mockTx.setAmount(BigDecimal.valueOf(50000.0));

        Category cat = new Category(); cat.setName("Test");
        Wallet wal = new Wallet(); wal.setName("Ví Test");
        mockTx.setCategory(cat);
        mockTx.setWallet(wal);

        when(transactionRepository.filterTransactions(eq(userId), isNull(), isNull(), eq(startDate), eq(endDate), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(mockTx)));

        byte[] pdfBytes = reportService.exportTransactionsToPdf(userId, null, startDate, endDate);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }
}