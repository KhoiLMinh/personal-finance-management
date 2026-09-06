package com.personal.finance.backend.common.scheduler;

import com.personal.finance.backend.bills.entity.RecurringBill;
import com.personal.finance.backend.bills.repository.RecurringBillRepository;
import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanceTaskSchedulerTest {

    @Mock private RecurringBillRepository recurringBillRepository;
    @Mock private SavingGoalRepository savingGoalRepository;
    @Mock private NotificationService notificationService;
    @Mock private EmailService emailService;

    @InjectMocks
    private FinanceTaskScheduler financeTaskScheduler;

    private User mockUser;
    private LocalDate today;
    private LocalDate tomorrow;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@gmail.com");

        today = LocalDate.now();
        tomorrow = today.plusDays(1);
    }

    @Test
    void processRecurringBills_DueToday_TriggersPriority1() {
        RecurringBill billDueToday = new RecurringBill();
        billDueToday.setId(10L);
        billDueToday.setTitle("Tiền điện");
        billDueToday.setAmount(BigDecimal.valueOf(500000));
        billDueToday.setFrequency(RecurringBill.Frequency.MONTHLY);
        billDueToday.setExecutionDay(today.getDayOfMonth());
        billDueToday.setNotificationTime(LocalTime.now().minusMinutes(10));
        billDueToday.setUser(mockUser);

        when(recurringBillRepository.findPendingBills(any(LocalDate.class))).thenReturn(List.of(billDueToday));

        financeTaskScheduler.processRecurringBills();

        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString(), eq(1));
        verify(emailService, times(1)).sendEmail(anyString(), anyString(), anyString());
        verify(recurringBillRepository, times(1)).save(billDueToday);
    }

    @Test
    void processRecurringBills_DueTomorrow_TriggersPriority2Warning() {
        RecurringBill billDueTomorrow = new RecurringBill();
        billDueTomorrow.setId(20L);
        billDueTomorrow.setTitle("Tiền mạng");
        billDueTomorrow.setAmount(BigDecimal.valueOf(200000));
        billDueTomorrow.setFrequency(RecurringBill.Frequency.MONTHLY);
        billDueTomorrow.setExecutionDay(tomorrow.getDayOfMonth());
        billDueTomorrow.setNotificationTime(LocalTime.now().minusMinutes(10));
        billDueTomorrow.setUser(mockUser);

        when(recurringBillRepository.findPendingBills(any(LocalDate.class))).thenReturn(List.of(billDueTomorrow));

        financeTaskScheduler.processRecurringBills();

        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString(), eq(2));
        verify(recurringBillRepository, times(1)).save(billDueTomorrow);
    }

    @Test
    void processRecurringBills_TimeNotReached_DoesNothing() {
        RecurringBill bill = new RecurringBill();
        bill.setFrequency(RecurringBill.Frequency.DAILY);
        bill.setNotificationTime(LocalTime.now().plusHours(1));

        when(recurringBillRepository.findPendingBills(any(LocalDate.class))).thenReturn(List.of(bill));

        financeTaskScheduler.processRecurringBills();
        verify(notificationService, never()).createSystemNotification(anyLong(), anyString(), anyString(), anyInt());
    }

    @Test
    void checkAndNotifySavingGoals_DueToday_TriggersPriority1() {
        SavingGoal goalDueToday = new SavingGoal();
        goalDueToday.setId(100L);
        goalDueToday.setTitle("Mua xe");
        goalDueToday.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        goalDueToday.setDeadline(today); // Hôm nay
        goalDueToday.setCurrentAmount(BigDecimal.ZERO);
        goalDueToday.setTargetAmount(BigDecimal.TEN);
        goalDueToday.setUser(mockUser);

        when(savingGoalRepository.findAll()).thenReturn(List.of(goalDueToday));

        financeTaskScheduler.checkAndNotifySavingGoals();

        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString(), eq(1)); // Priority 1
    }

    @Test
    void checkAndNotifySavingGoals_DueIn3Days_TriggersPriority2() {
        SavingGoal goalWarning = new SavingGoal();
        goalWarning.setId(101L);
        goalWarning.setTitle("Đi du lịch");
        goalWarning.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        goalWarning.setDeadline(today.plusDays(3));
        goalWarning.setCurrentAmount(BigDecimal.ZERO);
        goalWarning.setTargetAmount(BigDecimal.TEN);
        goalWarning.setUser(mockUser);

        when(savingGoalRepository.findAll()).thenReturn(List.of(goalWarning));

        financeTaskScheduler.checkAndNotifySavingGoals();

        verify(notificationService, times(1)).createSystemNotification(eq(1L), anyString(), anyString(), eq(2));
    }
}