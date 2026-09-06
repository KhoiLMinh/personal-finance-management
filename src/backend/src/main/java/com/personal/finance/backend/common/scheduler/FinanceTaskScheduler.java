package com.personal.finance.backend.common.scheduler;

import com.personal.finance.backend.bills.entity.RecurringBill;
import com.personal.finance.backend.bills.repository.RecurringBillRepository;
import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
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
public class FinanceTaskScheduler {

    private final RecurringBillRepository recurringBillRepository;
    private final SavingGoalRepository savingGoalRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    private boolean isExecutionDay(RecurringBill bill, LocalDate date) {
        if (bill.getFrequency() == RecurringBill.Frequency.DAILY) return true;
        if (bill.getFrequency() == RecurringBill.Frequency.WEEKLY) {
            int dayOfWeek = date.getDayOfWeek().getValue() + 1;
            return bill.getExecutionDay() != null && bill.getExecutionDay() == dayOfWeek;
        }
        if (bill.getFrequency() == RecurringBill.Frequency.MONTHLY) {
            int targetDay = bill.getExecutionDay() != null ? bill.getExecutionDay() : 1;
            if (targetDay > date.lengthOfMonth()) targetDay = date.lengthOfMonth();
            return date.getDayOfMonth() == targetDay;
        }
        return false;
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processRecurringBills() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalTime now = LocalTime.now();

        List<RecurringBill> pendingBills = recurringBillRepository.findPendingBills(today);

        for (RecurringBill bill : pendingBills) {
            boolean isTimeReached = bill.getNotificationTime() == null || !bill.getNotificationTime().isAfter(now);
            if (!isTimeReached) continue;

            if (isExecutionDay(bill, today)) {
                if (bill.getLastExecuted() == null || bill.getLastExecuted().isBefore(today)) {
                    String msg = String.format("ĐẾN HẠN: Hóa đơn '%s' (%,.0f VNĐ) cần được thanh toán trong hôm nay. Đừng để trễ hạn nhé!",
                            bill.getTitle(), bill.getAmount());

                    notificationService.createSystemNotification(bill.getUser().getId(), "Đến hạn thanh toán hóa đơn!", msg, 1);
                    emailService.sendEmail(bill.getUser().getEmail(), "[KHẨN] Thanh toán hóa đơn - Personal Finance", msg);

                    bill.setLastExecuted(today);
                    recurringBillRepository.save(bill);
                    log.info("[Scheduler] Đã gửi thông báo ĐẾN HẠN cho hóa đơn ID: {}", bill.getId());
                }
            }

            else if (bill.getFrequency() != RecurringBill.Frequency.DAILY && isExecutionDay(bill, tomorrow)) {
                if (bill.getLastWarning() == null || bill.getLastWarning().isBefore(today)) {
                    String msg = String.format("SẮP TỚI: Ngày mai là hạn thanh toán hóa đơn '%s' (Dự toán: %,.0f VNĐ). Hãy chuẩn bị ngân sách nhé!",
                            bill.getTitle(), bill.getAmount());

                    notificationService.createSystemNotification(bill.getUser().getId(), "Nhắc nhở sắp tới hạn hóa đơn", msg, 2);
                    emailService.sendEmail(bill.getUser().getEmail(), "Sắp đến hạn thanh toán hóa đơn - Personal Finance", msg);

                    bill.setLastWarning(today);
                    recurringBillRepository.save(bill);
                    log.info("[Scheduler] Đã gửi cảnh báo TRƯỚC 1 NGÀY cho hóa đơn ID: {}", bill.getId());
                }
            }
        }
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkAndNotifySavingGoals() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(3);

        List<SavingGoal> activeGoals = savingGoalRepository.findAll().stream()
                .filter(g -> g.getStatus() == SavingGoal.GoalStatus.IN_PROGRESS)
                .toList();

        for (SavingGoal goal : activeGoals) {
            if (goal.getDeadline().isEqual(today)) {
                String message = String.format("Mục tiêu '%s' của bạn ĐÃ ĐẾN HẠN hôm nay. Hiện tại bạn đã tích lũy được %,.0f / %,.0f VNĐ. Hãy kiểm tra lại nhé!",
                        goal.getTitle(), goal.getCurrentAmount(), goal.getTargetAmount());

                notificationService.createSystemNotification(goal.getUser().getId(), "🚨 Mục tiêu tiết kiệm đến hạn!", message, 1);
                emailService.sendEmail(goal.getUser().getEmail(), "[KHẨN] Nhắc nhở Mục tiêu tiết kiệm - Personal Finance", message);
                log.info("[Scheduler] Đã gửi nhắc nhở mục tiêu tiết kiệm ĐẾN HẠN ID {}", goal.getId());
            }
            else if (goal.getDeadline().isEqual(warningDate)) {
                String message = String.format("Mục tiêu '%s' của bạn sẽ đến hạn sau 3 ngày nữa (%s). Hiện tại bạn đã tích lũy được %,.0f / %,.0f VNĐ.",
                        goal.getTitle(), goal.getDeadline().toString(), goal.getCurrentAmount(), goal.getTargetAmount());

                notificationService.createSystemNotification(goal.getUser().getId(), "⏰ Mục tiêu tiết kiệm sắp đến hạn", message, 2);
                emailService.sendEmail(goal.getUser().getEmail(), "Nhắc nhở Mục tiêu tiết kiệm - Personal Finance", message);
                log.info("[Scheduler] Đã gửi nhắc nhở mục tiêu tiết kiệm SẮP ĐẾN HẠN ID {}", goal.getId());
            }
        }
    }
}