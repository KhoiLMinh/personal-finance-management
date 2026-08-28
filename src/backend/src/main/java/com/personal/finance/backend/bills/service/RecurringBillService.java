package com.personal.finance.backend.bills.service;

import com.personal.finance.backend.bills.dto.request.CreateRecurringBillRequest;
import com.personal.finance.backend.bills.dto.response.RecurringBillDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RecurringBillService {
    RecurringBillDTO createBill(Long userId, CreateRecurringBillRequest request);
    Page<RecurringBillDTO> getMyBills(Long userId, Pageable pageable);
    void deleteBill(Long id, Long userId);
}