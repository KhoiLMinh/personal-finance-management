package com.personal.finance.backend.reports.service;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;

import java.time.LocalDate;

public interface ReportService {
    DashboardOverviewDTO getDashboardOverview(Long userId, LocalDate startDate, LocalDate endDate);
}
