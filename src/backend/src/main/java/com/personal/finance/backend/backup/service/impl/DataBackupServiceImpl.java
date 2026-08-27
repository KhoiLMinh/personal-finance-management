package com.personal.finance.backend.backup.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.personal.finance.backend.backup.dto.BackupDataDTO;
import com.personal.finance.backend.backup.service.DataBackupService;
import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.budgets.entity.Budget;
import com.personal.finance.backend.budgets.repository.BudgetRepository;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;

// Import Mappers
import com.personal.finance.backend.budgets.mapper.BudgetMapper;
import com.personal.finance.backend.categories.mapper.CategoryMapper;
import com.personal.finance.backend.savingGoals.mapper.SavingGoalMapper;
import com.personal.finance.backend.transactions.mapper.TransactionMapper;
import com.personal.finance.backend.wallets.mapper.WalletMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataBackupServiceImpl implements DataBackupService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingGoalRepository savingGoalRepository;

    private final WalletMapper walletMapper;
    private final CategoryMapper categoryMapper;
    private final TransactionMapper transactionMapper;
    private final BudgetMapper budgetMapper;
    private final SavingGoalMapper savingGoalMapper;

    @Override
    public byte[] exportUserData(Long userId) {
        BackupDataDTO backupData = new BackupDataDTO();
        backupData.setExportDate(LocalDateTime.now().toString());

        // 1. Fetch data
        List<WalletDTO> wallets = walletRepository.findAllWalletAccessByUser(userId)
                .stream().map(walletMapper::toDTO).toList();
        List<CategoryDTO> categories = categoryRepository.findAllByUserIdOrderByCreateAtDesc(userId)
                .stream().map(categoryMapper::toDTO).toList();
        List<TransactionDTO> transactions = transactionRepository.filterTransactions(
                userId, null, null, null, null, null, Pageable.unpaged()
        ).getContent().stream().map(transactionMapper::toDTO).toList();
        List<BudgetDTO> budgets = budgetRepository.findAllByUserId(userId, Pageable.unpaged())
                .getContent().stream().map(budgetMapper::toDTO).toList();
        List<SavingGoalDTO> savingGoals = savingGoalRepository.findAllByUserId(userId, Pageable.unpaged())
                .getContent().stream().map(savingGoalMapper::toDTO).toList();

        backupData.setWallets(wallets);
        backupData.setCategories(categories);
        backupData.setTransactions(transactions);
        backupData.setBudgets(budgets);
        backupData.setSavingGoals(savingGoals);

        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(backupData);
        } catch (Exception e) {
            log.error("Lỗi khi tạo file backup: ", e);
            throw new RuntimeException("Không thể tạo file sao lưu lúc này!");
        }
    }

    @Override
    @Transactional
    public void importUserData(Long userId, MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            BackupDataDTO backup = mapper.readValue(file.getInputStream(), BackupDataDTO.class);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

            Map<Long, Long> walletIdMap = new HashMap<>();
            Map<Long, Long> categoryIdMap = new HashMap<>();

            if (backup.getWallets() != null) {
                for (WalletDTO wDto : backup.getWallets()) {
                    Wallet w = new Wallet();
                    w.setName(wDto.getName() + " [Phục hồi]");
                    w.setBalance(wDto.getBalance());
                    w.setIcon(wDto.getIcon());
                    w.setColor(wDto.getColor());
                    w.setOwner(user);
                    Wallet savedW = walletRepository.save(w);
                    walletIdMap.put(wDto.getId(), savedW.getId());
                }
            }

            if (backup.getCategories() != null) {
                for (CategoryDTO cDto : backup.getCategories()) {
                    Category c = new Category();
                    c.setName(cDto.getName());
                    c.setType(cDto.getType());
                    c.setIcon(cDto.getIcon());
                    c.setColor(cDto.getColor());
                    c.setUser(user);
                    Category savedC = categoryRepository.save(c);
                    categoryIdMap.put(cDto.getId(), savedC.getId());
                }
            }

            if (backup.getTransactions() != null) {
                for (TransactionDTO tDto : backup.getTransactions()) {
                    Long newWalletId = walletIdMap.get(tDto.getWalletId());
                    Long newCategoryId = categoryIdMap.get(tDto.getCategoryId());

                    if (newWalletId != null && newCategoryId != null) {
                        Transaction t = new Transaction();
                        t.setAmount(tDto.getAmount());
                        t.setType(Transaction.TransactionType.valueOf(tDto.getType()));
                        t.setDate(tDto.getDate());
                        t.setDescription(tDto.getDescription());
                        t.setStatus("COMPLETED");
                        t.setWallet(walletRepository.getReferenceById(newWalletId));
                        t.setCategory(categoryRepository.getReferenceById(newCategoryId));
                        transactionRepository.save(t);
                    }
                }
            }

            if (backup.getSavingGoals() != null) {
                for (SavingGoalDTO sgDto : backup.getSavingGoals()) {
                    SavingGoal sg = new SavingGoal();
                    sg.setTitle(sgDto.getTitle() + " [Phục hồi]");
                    sg.setTargetAmount(sgDto.getTargetAmount());
                    sg.setCurrentAmount(sgDto.getCurrentAmount());
                    sg.setDeadline(sgDto.getDeadline());
                    sg.setStatus(SavingGoal.GoalStatus.valueOf(sgDto.getStatus()));
                    sg.setUser(user);
                    savingGoalRepository.save(sg);
                }
            }

            log.info("Phục hồi dữ liệu thành công cho User ID: {}", userId);

        } catch (Exception e) {
            log.error("Lỗi khi đọc file phục hồi: ", e);
            throw new RuntimeException("File sao lưu không hợp lệ hoặc bị hỏng dữ liệu!");
        }
    }
}