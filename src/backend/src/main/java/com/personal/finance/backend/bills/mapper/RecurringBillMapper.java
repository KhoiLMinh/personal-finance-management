package com.personal.finance.backend.bills.mapper;

import com.personal.finance.backend.bills.dto.response.RecurringBillDTO;
import com.personal.finance.backend.bills.entity.RecurringBill;
import org.springframework.stereotype.Component;

@Component
public class RecurringBillMapper {
    public RecurringBillDTO toDTO(RecurringBill bill) {
        if (bill == null) return null;
        RecurringBillDTO dto = new RecurringBillDTO();
        dto.setId(bill.getId());
        dto.setTitle(bill.getTitle());
        dto.setAmount(bill.getAmount());
        dto.setFrequency(bill.getFrequency().name());
        dto.setNextDueDate(bill.getNextDueDate());
        dto.setDescription(bill.getDescription());
        return dto;
    }
}