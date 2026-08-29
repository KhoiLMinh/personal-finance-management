package com.personal.finance.backend.notifications.scheduler;

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
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final SavingGoalRepository savingGoalRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkAndNotifySavingGoals() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(3);
        List<SavingGoal> activeGoals = savingGoalRepository.findAll().stream()
                .filter(g -> g.getStatus() == SavingGoal.GoalStatus.IN_PROGRESS)
                .toList();

        for (SavingGoal goal : activeGoals) {
            if (goal.getDeadline().isEqual(warningDate) || goal.getDeadline().isEqual(today)) {
                String title = "Mục tiêu tiết kiệm sắp đến hạn!";
                String message = String.format("Mục tiêu '%s' của bạn sẽ đến hạn vào ngày %s. Hiện tại bạn đã tích lũy được %,.0f / %,.0f VNĐ. Hãy kiểm tra lại nhé!",
                        goal.getTitle(), goal.getDeadline().toString(), goal.getCurrentAmount(), goal.getTargetAmount());
                notificationService.createSystemNotification(goal.getUser().getId(), title, message);
                emailService.sendEmail(goal.getUser().getEmail(), "Nhắc nhở Mục tiêu tiết kiệm - Personal Finance", message);

                log.info("Đã gửi nhắc nhở mục tiêu tiết kiệm ID {} cho user {}", goal.getId(), goal.getUser().getId());
            }
        }
    }
}