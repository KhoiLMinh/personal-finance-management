package com.personal.finance.backend.bills.controller;

import com.personal.finance.backend.bills.dto.request.CreateRecurringBillRequest;
import com.personal.finance.backend.bills.dto.response.RecurringBillDTO;
import com.personal.finance.backend.bills.service.RecurringBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recurring-bills")
@RequiredArgsConstructor
public class RecurringBillController {

    private final RecurringBillService recurringBillService;

    @PostMapping
    public ResponseEntity<RecurringBillDTO> createBill(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateRecurringBillRequest request) {
        return ResponseEntity.ok(recurringBillService.createBill(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<RecurringBillDTO>> getMyBills(
            @RequestAttribute("userId") Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(recurringBillService.getMyBills(userId, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        recurringBillService.deleteBill(id, userId);
        return ResponseEntity.noContent().build();
    }
}