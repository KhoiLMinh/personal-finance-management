package com.personal.finance.backend.bills.scheduler;

import com.personal.finance.backend.bills.entity.RecurringBill;
import com.personal.finance.backend.bills.repository.RecurringBillRepository;
import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringBillScheduler {

    private final RecurringBillRepository recurringBillRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    //alarm at 7.00
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void processRecurringBills() {
        LocalDate today = LocalDate.now();
        List<RecurringBill> dueBills = recurringBillRepository.findAllDueBills(today);

        for (RecurringBill bill : dueBills) {
            String msg = String.format("Hôm nay là ngày đến hạn thanh toán hóa đơn '%s' với số tiền %,.0f VNĐ.",
                    bill.getTitle(), bill.getAmount());

            notificationService.createSystemNotification(bill.getUser().getId(), "Nhắc nhở hóa đơn", msg);
            emailService.sendEmail(bill.getUser().getEmail(), "Nhắc nhở thanh toán hóa đơn", msg);

            LocalDate nextDate = calculateNextDueDate(bill.getNextDueDate(), bill.getFrequency());
            bill.setNextDueDate(nextDate);
            recurringBillRepository.save(bill);
        }
    }

    private LocalDate calculateNextDueDate(LocalDate currentDate, RecurringBill.Frequency frequency) {
        return switch (frequency) {
            case DAILY -> currentDate.plusDays(1);
            case WEEKLY -> currentDate.plusWeeks(1);
            case MONTHLY -> currentDate.plusMonths(1);
            case YEARLY -> currentDate.plusYears(1);
        };
    }
}