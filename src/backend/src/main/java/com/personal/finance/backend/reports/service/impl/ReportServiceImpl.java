package com.personal.finance.backend.reports.service.impl;

import com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;
import com.personal.finance.backend.reports.service.ReportService;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public DashboardOverviewDTO getDashboardOverview(Long userId, LocalDate startDate, LocalDate endDate) {
        DashboardOverviewDTO overview = new DashboardOverviewDTO();
        
        Double totalBalance = walletRepository.getTotalBalanceAccessibleByUser(userId);
        overview.setTotalBalance(totalBalance);

        Double totalIncome = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, startDate, endDate);
        Double totalExpense = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, startDate, endDate);

        overview.setTotalIncome(totalIncome);
        overview.setTotalExpense(totalExpense);
        overview.setNetSavings(totalIncome - totalExpense);

        List<CategoryExpenseDTO> expenseByCategory = transactionRepository.getExpenseByCategory(userId, startDate, endDate);
        overview.setExpenseByCategory(expenseByCategory);

        return overview;
    }
}
