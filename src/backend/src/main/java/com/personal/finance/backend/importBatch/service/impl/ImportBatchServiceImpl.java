package com.personal.finance.backend.importBatch.service.impl;

import com.personal.finance.backend.ai_assistant.service.AiAssistantService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import com.personal.finance.backend.importBatch.entity.ImportBatch;
import com.personal.finance.backend.importBatch.mapper.ImportBatchMapper;
import com.personal.finance.backend.importBatch.repository.ImportBatchRepository;
import com.personal.finance.backend.importBatch.service.ImportBatchService;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportBatchServiceImpl implements ImportBatchService {

    private final ImportBatchRepository importBatchRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryRuleRepository categoryRuleRepository;
    private final UserRepository userRepository;
    private final AiAssistantService aiAssistantService;
    private final ImportBatchMapper importBatchMapper;

    private static final String CSV_SPLIT_REGEX = ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)";

    @Override
    @Transactional
    public ImportBatchDTO importCsv(Long userId, Long walletId, MultipartFile file) {
        if (!walletRepository.hasEditPermission(walletId, userId)) {
            throw new AccessDeniedException("Bạn không có quyền import dữ liệu vào ví này!");
        }

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví!"));

        ImportBatch batch = new ImportBatch();
        batch.setWallet(wallet);
        batch.setFileName(file.getOriginalFilename());
        batch = importBatchRepository.save(batch);

        Category uncategorized = getOrCreateUncategorizedCategory(userId);
        List<CategoryRule> userRules = categoryRuleRepository.findAllByUserIdOrderByPriorityDesc(userId);
        List<Category> allCategories = categoryRepository.findAllByUserIdOrderByCreateAtDesc(userId);

        List<Transaction> transactionsToSave = new ArrayList<>();
        List<Transaction> needAiCategorization = new ArrayList<>();
        List<String> descriptionsForAi = new ArrayList<>();
        BigDecimal netBalanceChange = BigDecimal.ZERO;
        int totalRows = 0;
        int successRows = 0;
        int duplicateRows = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) { isHeader = false; continue; }
                totalRows++;
                String[] fields = line.split(CSV_SPLIT_REGEX, -1);
                if (fields.length < 3) continue;
                LocalDate date = parseFlexibleDate(fields[0].replace("\"", "").trim());
                Double rawAmount = Double.parseDouble(fields[1].replace("\"", "").replace(",", "").trim());
                BigDecimal absoluteAmount = BigDecimal.valueOf(Math.abs(rawAmount));
                String description = fields[2].replace("\"", "").trim();

                if (transactionRepository.existsByWalletIdAndDateAndAmountAndDescription(walletId, date, absoluteAmount.doubleValue(), description)) {
                    duplicateRows++;
                    continue;
                }

                Category matchedCategory = categorizeTransaction(description, userRules, null);

                Transaction transaction = new Transaction();
                transaction.setWallet(wallet);
                transaction.setImportBatch(batch);
                transaction.setAmount(absoluteAmount);
                transaction.setType(rawAmount >= 0 ? Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);
                transaction.setDate(date);
                transaction.setDescription(description);
                transaction.setStatus("COMPLETED");

                if (matchedCategory != null) {
                    transaction.setCategory(matchedCategory);
                } else {
                    transaction.setCategory(uncategorized);
                    needAiCategorization.add(transaction);
                    descriptionsForAi.add(description);
                }

                transactionsToSave.add(transaction);
                netBalanceChange = netBalanceChange.add(BigDecimal.valueOf(rawAmount));
                successRows++;
            }

            if (!descriptionsForAi.isEmpty()) {
                log.info("Gọi AI để phân loại {} giao dịch...", descriptionsForAi.size());
                Map<String, Long> aiResults = aiAssistantService.categorizeTransactionsBatch(descriptionsForAi, allCategories);
                for (Transaction t : needAiCategorization) {
                    Long predictedCategoryId = aiResults.get(t.getDescription());
                    if (predictedCategoryId != null) {
                        allCategories.stream()
                                .filter(c -> c.getId().equals(predictedCategoryId))
                                .findFirst()
                                .ifPresent(t::setCategory);
                    }
                }
            }

            if (!transactionsToSave.isEmpty()) {
                transactionRepository.saveAll(transactionsToSave);
                walletRepository.updateBalance(walletId, netBalanceChange);
            }

            batch.setTotalRows(totalRows);
            batch.setSuccessRows(successRows);
            batch.setDuplicatedRows(duplicateRows);
            batch.setStatus(true);
            importBatchRepository.save(batch);

            log.info("Import thành công file {} cho ví {}. Tổng: {}, Mới: {}, Trùng: {}",
                    file.getOriginalFilename(), walletId, totalRows, successRows, duplicateRows);

        } catch (Exception e) {
            log.error("Lỗi khi parse file CSV: ", e);
            throw new RuntimeException("Định dạng file CSV không hợp lệ hoặc chứa dữ liệu sai. Rollback toàn bộ!");
        }

        return importBatchMapper.toDTO(batch);
    }

    private LocalDate parseFlexibleDate(String dateStr) {
        String[] dateFormats = {"d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "d-M-yyyy", "dd-MM-yyyy"};
        for (String format : dateFormats) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(format));
            } catch (Exception ignored) {
            }
        }
        throw new RuntimeException("Không hỗ trợ định dạng ngày: " + dateStr);
    }

    private Category categorizeTransaction(String description, List<CategoryRule> rules, Category fallback) {
        String lowerDesc = description.toLowerCase();
        for (CategoryRule rule : rules) {
            if (lowerDesc.contains(rule.getKeyword().toLowerCase())) {
                return rule.getCategory();
            }
        }
        return fallback;
    }

    private Category getOrCreateUncategorizedCategory(Long userId) {
        return categoryRepository.findByNameAndUserId("Chưa phân loại", userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    Category cat = new Category();
                    cat.setName("Chưa phân loại");
                    cat.setType(Category.CategoryType.EXPENSE);
                    cat.setUser(user);
                    cat.setColor("#808080");
                    return categoryRepository.save(cat);
                });
    }
}