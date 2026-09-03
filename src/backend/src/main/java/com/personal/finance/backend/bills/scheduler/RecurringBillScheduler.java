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
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringBillScheduler {

    private final RecurringBillRepository recurringBillRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processRecurringBills() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<RecurringBill> pendingBills = recurringBillRepository.findPendingBills(today);

        for (RecurringBill bill : pendingBills) {
            boolean shouldExecuteToday = false;

            if (bill.getFrequency() == RecurringBill.Frequency.DAILY) {
                shouldExecuteToday = true;
            } else if (bill.getFrequency() == RecurringBill.Frequency.WEEKLY) {
                int currentDayOfWeek = today.getDayOfWeek().getValue() + 1;
                if (bill.getExecutionDay() != null && bill.getExecutionDay() == currentDayOfWeek) {
                    shouldExecuteToday = true;
                }
            } else if (bill.getFrequency() == RecurringBill.Frequency.MONTHLY) {
                int currentDay = today.getDayOfMonth();
                int lastDayOfMonth = today.lengthOfMonth();
                int targetDay = bill.getExecutionDay() != null ? bill.getExecutionDay() : 1;

                if (targetDay > lastDayOfMonth) targetDay = lastDayOfMonth;

                if (currentDay == targetDay) shouldExecuteToday = true;
            }

            if (shouldExecuteToday) {
                boolean isTimeReached = bill.getNotificationTime() == null || !bill.getNotificationTime().isAfter(now);

                if (isTimeReached) {
                    String msg = String.format("Đã đến hạn thanh toán hóa đơn định kỳ '%s' với dự toán khoảng %,.0f VNĐ. Hãy kiểm tra và thanh toán nhé!",
                            bill.getTitle(), bill.getAmount());
                    notificationService.createSystemNotification(bill.getUser().getId(), "Nhắc nhở thanh toán hóa đơn", msg);
                    emailService.sendEmail(bill.getUser().getEmail(), "Nhắc nhở thanh toán hóa đơn - Personal Finance", msg);

                    bill.setLastExecuted(today);
                    recurringBillRepository.save(bill);

                    log.info("Đã gửi thông báo nhắc nhở hóa đơn ID: {} cho user {}", bill.getId(), bill.getUser().getUsername());
                }
            }
        }
    }
}