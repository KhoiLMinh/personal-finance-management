package com.personal.finance.backend.bills.mapper;

import com.personal.finance.backend.bills.dto.response.RecurringBillDTO;
import com.personal.finance.backend.bills.entity.RecurringBill;
import jakarta.persistence.Column;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class RecurringBillMapper {
    public RecurringBillDTO toDTO(RecurringBill bill) {
        if (bill == null) return null;
        RecurringBillDTO dto = new RecurringBillDTO();
        dto.setId(bill.getId());
        dto.setTitle(bill.getTitle());
        dto.setAmount(bill.getAmount());
        dto.setFrequency(bill.getFrequency().name());
        dto.setDescription(bill.getDescription());
        dto.setExecutionDay(bill.getExecutionDay());
        dto.setLastWarning(bill.getLastWarning());

        if (bill.getNotificationTime() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            dto.setNotificationTime(bill.getNotificationTime().format(formatter));
        }
        dto.setCreateAt(bill.getCreateAt());
        return dto;
    }
}