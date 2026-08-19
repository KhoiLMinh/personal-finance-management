package com.personal.finance.backend.configs;

import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
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

import java.time.LocalDate;
import java.util.ArrayList;
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
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingGoalRepository savingGoalRepository;

    @Override
    @Transactional // Bắt buộc có Transactional để thao tác ghi nhiều bảng liên tục
    public void run(String... args) throws Exception {

        // ================= 1. TẠO USERS =================
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("Demo@123"));
            admin.setFullName("Quản Trị Viên");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }

        User demoUser;
        if (!userRepository.existsByUsername("user_demo")) {
            User user = new User();
            user.setUsername("user_demo");
            user.setEmail("user_demo@example.com");
            user.setPassword(passwordEncoder.encode("Demo@123"));
            user.setFullName("Minh Khôi"); // Khớp với thiết kế của bạn
            user.setRole(User.Role.USER);
            demoUser = userRepository.save(user);
            log.info("Đã tạo tài khoản USER: user_demo / Demo@123");
        } else {
            demoUser = userRepository.findByUsername("user_demo").get();
        }

        // ================= KIỂM TRA ĐÃ SEED CHƯA =================
        if (walletRepository.findAllWalletAccessByUser(demoUser.getId()).size() > 0) {
            log.info("Dữ liệu mẫu cho user_demo đã tồn tại, bỏ qua quá trình Seed Data.");
            return;
        }

        log.info("Bắt đầu khởi tạo dữ liệu mẫu (Seed Data) cho user_demo...");

        // ================= 2. TẠO VÍ (WALLETS) =================
        Wallet walletCash = new Wallet();
        walletCash.setOwner(demoUser);
        walletCash.setName("Tiền mặt");
        walletCash.setIcon("Wallet");
        walletCash.setColor("#10b981");
        walletCash.setBalance(5000000.0);
        walletRepository.save(walletCash);

        Wallet walletBank = new Wallet();
        walletBank.setOwner(demoUser);
        walletBank.setName("Vietcombank");
        walletBank.setIcon("CreditCard");
        walletBank.setColor("#3b82f6");
        walletBank.setBalance(44500000.0); // Khớp với hình 5.png
        walletRepository.save(walletBank);

        // ================= 3. TẠO DANH MỤC (CATEGORIES) =================
        String[][] expenses = {
                {"Ăn uống", "#ef4444", "Utensils"},
                {"Di chuyển", "#f59e0b", "Car"},
                {"Mua sắm", "#8b5cf6", "ShoppingBag"},
                {"Hóa đơn", "#ec4899", "FileText"},
                {"Sức khỏe", "#14b8a6", "Activity"},
                {"Giải trí", "#8b5cf6", "Gamepad2"}
        };
        List<Category> expenseCategories = new ArrayList<>();
        for (String[] cat : expenses) {
            Category c = new Category();
            c.setUser(demoUser);
            c.setName(cat[0]);
            c.setType(Category.CategoryType.EXPENSE);
            c.setColor(cat[1]);
            c.setIcon(cat[2]);
            expenseCategories.add(categoryRepository.save(c));
        }

        Category salaryCat = new Category();
        salaryCat.setUser(demoUser);
        salaryCat.setName("Tiền lương");
        salaryCat.setType(Category.CategoryType.INCOME);
        salaryCat.setColor("#10b981");
        salaryCat.setIcon("Banknote");
        salaryCat = categoryRepository.save(salaryCat);

        Category bonusCat = new Category();
        bonusCat.setUser(demoUser);
        bonusCat.setName("Thưởng & Lãi");
        bonusCat.setType(Category.CategoryType.INCOME);
        bonusCat.setColor("#3b82f6");
        bonusCat.setIcon("TrendingUp");
        bonusCat = categoryRepository.save(bonusCat);

        // ================= 4. TẠO MỤC TIÊU TIẾT KIỆM (SAVING GOALS) =================
        SavingGoal goal1 = new SavingGoal();
        goal1.setUser(demoUser);
        goal1.setTitle("Đổi xe SH");
        goal1.setTargetAmount(80000000.0);
        goal1.setCurrentAmount(18000000.0); // Khớp hình 3.png
        goal1.setDeadline(LocalDate.now().plusMonths(6));
        goal1.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        savingGoalRepository.save(goal1);

        SavingGoal goal2 = new SavingGoal();
        goal2.setUser(demoUser);
        goal2.setTitle("Quỹ khẩn cấp");
        goal2.setTargetAmount(30000000.0);
        goal2.setCurrentAmount(30000000.0);
        goal2.setDeadline(LocalDate.now().plusMonths(1));
        goal2.setStatus(SavingGoal.GoalStatus.COMPLETE);
        savingGoalRepository.save(goal2);

        // ================= 5. TẠO NGÂN SÁCH (BUDGETS) THÁNG NÀY =================
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        Budget budget1 = new Budget();
        budget1.setUser(demoUser);
        budget1.setCategory(expenseCategories.get(0)); // Ăn uống
        budget1.setMonth(currentMonth);
        budget1.setYear(currentYear);
        budget1.setLimitAmount(6000000.0); // Khớp hình 4.png
        budget1.setWarningPercent(80.0);
        budget1.setStatus(Budget.BudgetStatus.ACTIVE);
        budgetRepository.save(budget1);

        Budget budget2 = new Budget();
        budget2.setUser(demoUser);
        budget2.setCategory(expenseCategories.get(2)); // Mua sắm
        budget2.setMonth(currentMonth);
        budget2.setYear(currentYear);
        budget2.setLimitAmount(2000000.0);
        budget2.setWarningPercent(90.0);
        budget2.setStatus(Budget.BudgetStatus.EXCEED); // Giả lập đã vượt ngân sách
        budgetRepository.save(budget2);

        // ================= 6. TẠO GIAO DỊCH (TRANSACTIONS) =================
        // Chèn lương tháng trước và tháng này
        createTx(walletBank, salaryCat, 25000000.0, Transaction.TransactionType.INCOME, today.minusMonths(1).withDayOfMonth(5), "Lương tháng trước");
        createTx(walletBank, salaryCat, 28000000.0, Transaction.TransactionType.INCOME, today.withDayOfMonth(5), "Lương tháng này");
        createTx(walletBank, bonusCat, 5000000.0, Transaction.TransactionType.INCOME, today.withDayOfMonth(15), "Tiền làm dự án ngoài");

        // Rải rác các giao dịch chi tiêu trong 45 ngày qua (Để vẽ biểu đồ)
        Random random = new Random();
        for (int i = 0; i < 35; i++) {
            // Random ngày trong khoảng 45 ngày trở lại
            LocalDate randomDate = today.minusDays(random.nextInt(45));
            // Random danh mục chi tiêu
            Category randomCategory = expenseCategories.get(random.nextInt(expenseCategories.size()));
            // Random số tiền (từ 50.000 đến 1.500.000)
            Double randomAmount = 50000.0 + (random.nextInt(30) * 50000.0);

            // Random chọn ví trả tiền
            Wallet selectedWallet = random.nextBoolean() ? walletCash : walletBank;

            createTx(selectedWallet, randomCategory, randomAmount, Transaction.TransactionType.EXPENSE, randomDate, "Chi tiêu tự động " + i);
        }

        // Chèn giao dịch khớp với hình 2.png
        createTx(walletCash, expenseCategories.get(0), 100000.0, Transaction.TransactionType.EXPENSE, today, "Phở sáng");
        createTx(walletCash, expenseCategories.get(1), 100000.0, Transaction.TransactionType.EXPENSE, today, "Đổ xăng");

        log.info("Đã seed thành công dữ liệu mẫu siêu to khổng lồ!");
    }

    // Hàm phụ trợ tạo Giao dịch cho ngắn code
    private void createTx(Wallet wallet, Category category, Double amount, Transaction.TransactionType type, LocalDate date, String desc) {
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