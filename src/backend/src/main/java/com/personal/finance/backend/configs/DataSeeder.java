package com.personal.finance.backend.configs;

import com.personal.finance.backend.bills.entity.RecurringBill;
import com.personal.finance.backend.bills.repository.RecurringBillRepository;
import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.categories.service.CategoryService;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.settings.entity.SystemSetting;
import com.personal.finance.backend.settings.repository.SystemSettingRepository;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryRuleRepository categoryRuleRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingGoalRepository savingGoalRepository;
    private final RecurringBillRepository recurringBillRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final CategoryService categoryService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        if (systemSettingRepository.count() == 0) {
            systemSettingRepository.save(new SystemSetting("DEFAULT_BUDGET_WARNING_PERCENT", "80", "Ngưỡng cảnh báo ngân sách mặc định (%)"));
        }

        User admin1 = createOrGetUser("admin", "admin@example.com", "Admin Tối Cao", User.Role.ADMIN);
        if (categoryRepository.findAllByUserIdOrderByCreateAtDesc(admin1.getId()).isEmpty()) {
            seedSystemCategories(admin1);
        }
        createOrGetUser("admin2", "admin2@example.com", "Quản lý Hệ thống", User.Role.ADMIN);

        User demoUser = createOrGetUser("user_demo", "user_demo@example.com", "Khách Hàng VIP", User.Role.USER);
        createOrGetUser("user_01", "user_1@example.com", "Nguyễn Văn A", User.Role.USER);
        createOrGetUser("user_02", "user_2@example.com", "Trần Thị B", User.Role.USER);

        if (walletRepository.findAllWalletAccessByUser(demoUser.getId()).isEmpty()) {
            seedFinancialDataForUser(demoUser);
        } else {
            log.info("Dữ liệu tài chính mẫu đã tồn tại, bỏ qua Seed Data.");
        }
    }

    private User createOrGetUser(String username, String email, String fullName, User.Role role) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("123"));
            user.setFullName(fullName);
            user.setRole(role);
            user = userRepository.save(user);

            if (role == User.Role.USER) {
                categoryService.cloneAdminCategoriesForNewUser(user);
            }
            log.info("Đã tạo tài khoản {}: {} / Pass: 123", role.name(), username);
            return user;
        });
    }

    private void seedSystemCategories(User admin) {
        Category foodCat = createCat(admin, "Ăn uống", Category.CategoryType.EXPENSE, "#ef4444", "Utensils", null);
        createCat(admin, "Cà phê", Category.CategoryType.EXPENSE, "#f87171", "Utensils", foodCat);
        Category transportCat = createCat(admin, "Di chuyển", Category.CategoryType.EXPENSE, "#f59e0b", "Car", null);
        createCat(admin, "Taxi / Grab", Category.CategoryType.EXPENSE, "#fbbf24", "Car", transportCat);
        createCat(admin, "Mua sắm", Category.CategoryType.EXPENSE, "#8b5cf6", "ShoppingBag", null);
        createCat(admin, "Hóa đơn", Category.CategoryType.EXPENSE, "#ec4899", "FileText", null);
        createCat(admin, "Tiền lương", Category.CategoryType.INCOME, "#10b981", "Banknote", null);

        CategoryRule rule1 = new CategoryRule();
        rule1.setCategory(foodCat);
        rule1.setKeyword("Highlands");
        rule1.setPriority(1);
        categoryRuleRepository.save(rule1);

        CategoryRule rule2 = new CategoryRule();
        rule2.setCategory(transportCat);
        rule2.setKeyword("Grab");
        rule2.setPriority(2);
        categoryRuleRepository.save(rule2);
    }

    private void seedFinancialDataForUser(User user) {
        Wallet walletCash = new Wallet();
        walletCash.setOwner(user);
        walletCash.setName("Tiền mặt");
        walletCash.setIcon("Wallet");
        walletCash.setColor("#10b981");
        walletCash.setBalance(BigDecimal.valueOf(5000000.0));
        walletRepository.save(walletCash);

        Wallet walletBank = new Wallet();
        walletBank.setOwner(user);
        walletBank.setName("Vietcombank");
        walletBank.setIcon("CreditCard");
        walletBank.setColor("#3b82f6");
        walletBank.setBalance(BigDecimal.valueOf(44500000.0));
        walletRepository.save(walletBank);

        List<Category> availableCategories = categoryRepository.findAvailableCategories(user.getId());
        Category foodCat = availableCategories.stream().filter(c -> c.getName().equals("Ăn uống")).findFirst().get();
        Category shoppingCat = availableCategories.stream().filter(c -> c.getName().equals("Mua sắm")).findFirst().get();
        Category salaryCat = availableCategories.stream().filter(c -> c.getName().equals("Tiền lương")).findFirst().get();
        Category personalHobby = createCat(user, "Sở thích cá nhân", Category.CategoryType.EXPENSE, "#14b8a6", "Activity", null);

        SavingGoal goal1 = new SavingGoal();
        goal1.setUser(user);
        goal1.setTitle("Đổi xe SH");
        goal1.setTargetAmount(BigDecimal.valueOf(80000000.0));
        goal1.setCurrentAmount(BigDecimal.valueOf(18000000.0));
        goal1.setDeadline(LocalDate.now().plusMonths(6));
        goal1.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        savingGoalRepository.save(goal1);

        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        Budget budget1 = new Budget();
        budget1.setUser(user);
        budget1.setCategory(foodCat);
        budget1.setMonth(currentMonth);
        budget1.setYear(currentYear);
        budget1.setLimitAmount(BigDecimal.valueOf(6000000.0));
        budget1.setWarningPercent(80.0);
        budget1.setStatus(Budget.BudgetStatus.ACTIVE);
        budgetRepository.save(budget1);

        RecurringBill bill1 = new RecurringBill();
        bill1.setUser(user);
        bill1.setTitle("Tiền mạng Internet");
        bill1.setAmount(BigDecimal.valueOf(250000));
        bill1.setFrequency(RecurringBill.Frequency.MONTHLY);
        bill1.setExecutionDay(15);
        bill1.setNotificationTime(LocalTime.of(8, 0));
        recurringBillRepository.save(bill1);

        createTx(walletBank, salaryCat, BigDecimal.valueOf(25000000.0), Transaction.TransactionType.INCOME, today.minusMonths(1).withDayOfMonth(5), "Lương tháng trước");
        createTx(walletBank, salaryCat, BigDecimal.valueOf(28000000.0), Transaction.TransactionType.INCOME, today.withDayOfMonth(5), "Lương tháng này");

        List<Category> expenseCats = List.of(foodCat, shoppingCat, personalHobby);
        Random random = new Random();
        for (int i = 0; i < 35; i++) {
            LocalDate randomDate = today.minusDays(random.nextInt(45));
            Category randomCategory = expenseCats.get(random.nextInt(expenseCats.size()));
            BigDecimal randomAmount = BigDecimal.valueOf(50000.0 + (random.nextInt(30) * 50000.0));
            Wallet selectedWallet = random.nextBoolean() ? walletCash : walletBank;

            createTx(selectedWallet, randomCategory, randomAmount, Transaction.TransactionType.EXPENSE, randomDate, "Chi tiêu tự động " + i);
        }

        log.info("Đã seed thành công dữ liệu tài chính mẫu cho user_demo!");
    }

    private Category createCat(User user, String name, Category.CategoryType type, String color, String icon, Category parent) {
        Category c = new Category();
        c.setUser(user);
        c.setName(name);
        c.setType(type);
        c.setColor(color);
        c.setIcon(icon);
        c.setParent(parent);
        return categoryRepository.save(c);
    }

    private void createTx(Wallet wallet, Category category, BigDecimal amount, Transaction.TransactionType type, LocalDate date, String desc) {
        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setCategory(category);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setDate(date);
        tx.setDescription(desc);
        tx.setStatus("COMPLETED");
        transactionRepository.save(tx);
    }
}