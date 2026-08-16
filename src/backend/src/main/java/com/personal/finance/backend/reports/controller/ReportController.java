package com.personal.finance.backend.reports.controller;

import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;
import com.personal.finance.backend.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDTO> getOverview(
            @RequestAttribute("userId") Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDate today = LocalDate.now();
        if (endDate == null) {
            endDate = today;
        }

        if (startDate == null) {
            startDate = today.withDayOfMonth(1);
        }

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }

        return ResponseEntity.ok(reportService.getDashboardOverview(userId, startDate, endDate));
    }
}
