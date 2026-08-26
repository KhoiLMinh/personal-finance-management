package com.personal.finance.backend.ai_assistant.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personal.finance.backend.ai_assistant.dto.response.ReceiptScanResponseDTO;
import com.personal.finance.backend.ai_assistant.service.AiAssistantService;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import com.personal.finance.backend.categories.repository.CategoryRepository;
import com.personal.finance.backend.categories.repository.CategoryRuleRepository;
import com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;
import com.personal.finance.backend.reports.service.ReportService;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final ReportService reportService;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryRuleRepository categoryRuleRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=";
    @Override
    public String analyzeReport(Long userId, LocalDate startDate, LocalDate endDate) {
        DashboardOverviewDTO overview = reportService.getDashboardOverview(userId, startDate, endDate);

        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("Dữ liệu tài chính từ %s đến %s:\n", startDate, endDate));
        prompt.append(String.format("- Tổng thu nhập: %,.0f VNĐ\n", overview.getTotalIncome()));
        prompt.append(String.format("- Tổng chi tiêu: %,.0f VNĐ\n", overview.getTotalExpense()));
        prompt.append(String.format("- Tiền dư ra: %,.0f VNĐ\n", overview.getNetSavings()));

        prompt.append("- Chi tiết khoản chi:\n");
        for (CategoryExpenseDTO expense : overview.getExpenseByCategory()) {
            prompt.append(String.format("  + %s: %,.0f VNĐ\n", expense.getCategoryName(), expense.getTotalAmount()));
        }

        String systemInstruction = "Bạn là chuyên gia tài chính. Hãy nhận xét ngắn gọn (dưới 150 chữ) về báo cáo thu chi này và cho 2 lời khuyên cụ thể.";
        return callGeminiTextApi(systemInstruction, prompt.toString());
    }

    @Override
    public String chatWithAi(Long userId, String userMessage) {
        Double currentBalance = walletRepository.getTotalBalanceAccessibleByUser(userId);
        String systemInstruction = String.format(
                "Bạn là Trợ lý tài chính ảo thông minh. Người dùng hiện đang có tổng số dư là %,.0f VNĐ trong các ví. " +
                        "Hãy trả lời câu hỏi của họ một cách ngắn gọn, thân thiện và có tính chuyên môn tài chính.",
                currentBalance
        );
        return callGeminiTextApi(systemInstruction, userMessage);
    }
    //FR-06, FR-08
    @Override
    public Map<String, Long> categorizeTransactionsBatch(List<String> descriptions, List<Category> userCategories) {
        if (descriptions.isEmpty()) return new HashMap<>();

        StringBuilder categoriesStr = new StringBuilder();
        for (Category cat : userCategories) {
            categoriesStr.append(String.format("- ID: %d, Tên: %s\n", cat.getId(), cat.getName()));
        }

        String systemInstruction = "Bạn là trợ lý phân loại chi tiêu. " +
                "Tôi cung cấp danh mục hiện có (gồm ID và Tên) và mảng nội dung giao dịch. " +
                "Hãy dự đoán mỗi giao dịch thuộc ID danh mục nào hợp lý nhất. " +
                "Trả về JSON thuần túy định dạng {\"Nội dung\": ID}. KHÔNG markdown, KHÔNG ```json. " +
                "Nếu không biết, để null.\n\nDanh mục:\n" + categoriesStr.toString();

        try {
            String userPrompt = objectMapper.writeValueAsString(descriptions);
            String responseStr = callGeminiTextApi(systemInstruction, userPrompt);

            responseStr = responseStr.replace("```json", "").replace("```", "").trim();
            return objectMapper.readValue(responseStr, new TypeReference<Map<String, Long>>(){});
        } catch (Exception e) {
            log.error("Lỗi khi AI phân loại hàng loạt: ", e);
            return new HashMap<>();
        }
    }
    //FR-06, FR-08
    @Override
    public ReceiptScanResponseDTO scanReceipt(Long userId, MultipartFile file) {
        try {
            List<Category> categories = categoryRepository.findAvailableCategories(userId);
            List<CategoryRule> rules = categoryRuleRepository.findAllByUserIdOrderByPriorityDesc(userId);

            StringBuilder catStr = new StringBuilder();
            for (Category c : categories) {
                catStr.append(String.format("- ID: %d, Tên: %s\n", c.getId(), c.getName()));
                catStr.append(String.format("- ID: %d, Tên: %s\n", c.getId(), c.getName()));
            }

            String mimeType = file.getContentType();
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

            String url = GEMINI_API_URL + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String promptText = "Bạn là máy quét hóa đơn. Trích xuất: Tổng tiền (amount - số), Ngày (date - dd/MM/yyyy), Nội dung ngắn gọn nhất có thể (description). " +
                    "Dựa vào nội dung và danh sách danh mục sau, dự đoán ID danh mục (categoryId). Nếu không có, để null. " +
                    "Trả JSON thuần (KHÔNG markdown). VD: {\"amount\":15000, \"date\":\"25/10/2026\", \"description\":\"Cà phê\", \"categoryId\":12}\n" +
                    "Danh mục:\n" + catStr.toString();

            Map<String, Object> textPart = Map.of("text", promptText);
            Map<String, Object> inlineData = Map.of(
                    "mime_type", mimeType,
                    "data", base64Image
            );
            Map<String, Object> imagePart = Map.of("inline_data", inlineData);
            Map<String, Object> contentMap = Map.of("parts", List.of(textPart, imagePart));

            Map<String, Object> requestBody = Map.of("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String contentStr = (String) parts.get(0).get("text");

            contentStr = contentStr.replace("```json", "").replace("```", "").trim();
            ReceiptScanResponseDTO dto = objectMapper.readValue(contentStr, ReceiptScanResponseDTO.class);

            if (dto.getDescription() != null) {
                String lowerDesc = dto.getDescription().toLowerCase();
                for (CategoryRule rule : rules) {
                    if (lowerDesc.contains(rule.getKeyword().toLowerCase())) {
                        dto.setCategoryId(rule.getCategory().getId());
                        break;
                    }
                }
            }

            return dto;

        } catch (Exception e) {
            log.error("Lỗi quét hóa đơn bằng Gemini: ", e);
            throw new RuntimeException("Không thể đọc được hóa đơn này. Vui lòng đảm bảo ảnh chụp rõ nét!");
        }
    }

    private String callGeminiTextApi(String systemInstruction, String userPrompt) {
        String url = GEMINI_API_URL + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> systemPart = Map.of("text", systemInstruction);
        Map<String, Object> systemInstructionMap = Map.of("parts", List.of(systemPart));

        Map<String, Object> userPart = Map.of("text", userPrompt);
        Map<String, Object> contentMap = Map.of("parts", List.of(userPart));

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstructionMap,
                "contents", List.of(contentMap)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: ", e);

            throw new RuntimeException(
                    "Gemini API error: " + e.getMessage()
            );
        }
    }
}