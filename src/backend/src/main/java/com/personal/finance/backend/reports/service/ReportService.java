package com.personal.finance.backend.reports.service;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;

import java.time.LocalDate;

public interface ReportService {
    DashboardOverviewDTO getDashboardOverview(Long userId, LocalDate startDate, LocalDate endDate, String timeUnit);
    byte[] exportTransactionsToExcel(Long userId, Long walletId, LocalDate startDate, LocalDate endDate);
    byte[] exportTransactionsToPdf(Long userId, Long walletId, LocalDate startDate, LocalDate endDate);
}
