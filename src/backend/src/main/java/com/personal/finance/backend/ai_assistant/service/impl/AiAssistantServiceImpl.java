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

    @Value("${app.openai.api-key}")
    private String openAiApiKey;

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
        return callOpenAiTextApi(systemInstruction, prompt.toString(), "gpt-3.5-turbo");
    }

    @Override
    public String chatWithAi(Long userId, String userMessage) {
        Double currentBalance = walletRepository.getTotalBalanceAccessibleByUser(userId);
        String systemInstruction = String.format(
                "Bạn là Trợ lý tài chính ảo thông minh. Người dùng hiện đang có tổng số dư là %,.0f VNĐ trong các ví. " +
                        "Hãy trả lời câu hỏi của họ một cách ngắn gọn, thân thiện và có tính chuyên môn tài chính.",
                currentBalance
        );
        return callOpenAiTextApi(systemInstruction, userMessage, "gpt-3.5-turbo");
    }

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
            String responseStr = callOpenAiTextApi(systemInstruction, userPrompt, "gpt-3.5-turbo");

            responseStr = responseStr.replace("```json", "").replace("```", "").trim();
            return objectMapper.readValue(responseStr, new TypeReference<Map<String, Long>>(){});
        } catch (Exception e) {
            log.error("Lỗi khi AI phân loại hàng loạt: ", e);
            return new HashMap<>();
        }
    }


    @Override
    public ReceiptScanResponseDTO scanReceipt(Long userId, MultipartFile file) {
        try {
            List<Category> categories = categoryRepository.findAllByUserIdOrderByCreateAtDesc(userId);
            List<CategoryRule> rules = categoryRuleRepository.findAllByUserIdOrderByPriorityDesc(userId);

            StringBuilder catStr = new StringBuilder();
            for (Category c : categories) {
                catStr.append(String.format("- ID: %d, Tên: %s\n", c.getId(), c.getName()));
            }

            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUrl = "data:" + file.getContentType() + ";base64," + base64Image;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            String promptText = "Bạn là máy quét hóa đơn. Trích xuất: Tổng tiền (amount - số), Ngày (date - dd/MM/yyyy), Nội dung ngắn gọn nhất có thể (description). " +
                    "Dựa vào nội dung và danh sách danh mục sau, dự đoán ID danh mục (categoryId). Nếu không có, để null. " +
                    "Trả JSON thuần (KHÔNG markdown). VD: {\"amount\":15000, \"date\":\"25/10/2026\", \"description\":\"Cà phê\", \"categoryId\":12}\n" +
                    "Danh mục:\n" + catStr.toString();

            Map<String, Object> textContent = Map.of("type", "text", "text", promptText);
            Map<String, Object> imageContent = Map.of("type", "image_url", "image_url", Map.of("url", dataUrl));
            Map<String, Object> message = Map.of("role", "user", "content", List.of(textContent, imageContent));

            Map<String, Object> requestBody = Map.of(
                    "model", "gpt-4o",
                    "messages", List.of(message),
                    "max_tokens", 300
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity("https://api.openai.com/v1/chat/completions", entity, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

            content = content.replace("```json", "").replace("```", "").trim();
            ReceiptScanResponseDTO dto = objectMapper.readValue(content, ReceiptScanResponseDTO.class);

            if (dto.getDescription() != null) {
                String lowerDesc = dto.getDescription().toLowerCase();
                for (CategoryRule rule : rules) {
                    if (lowerDesc.contains(rule.getKeyword().toLowerCase())) {
                        dto.setCategoryId(rule.getCategory().getId()); // GHI ĐÈ KẾT QUẢ AI BẰNG RULE
                        log.info("Phát hiện Rule từ khóa '{}'. Đã ghi đè CategoryId thành: {}", rule.getKeyword(), rule.getCategory().getId());
                        break;
                    }
                }
            }

            return dto;

        } catch (Exception e) {
            log.error("Lỗi quét hóa đơn: ", e);
            throw new RuntimeException("Không thể đọc được hóa đơn này. Vui lòng đảm bảo ảnh chụp rõ nét!");
        }
    }

    private String callOpenAiTextApi(String systemInstruction, String userPrompt, String model) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> systemMessage = Map.of("role", "system", "content", systemInstruction);
        Map<String, Object> userMessage = Map.of("role", "user", "content", userPrompt);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(systemMessage, userMessage),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity("https://api.openai.com/v1/chat/completions", entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            return (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
        } catch (Exception e) {
            log.error("Lỗi khi gọi OpenAI: ", e);
            return "Trợ lý AI đang quá tải, vui lòng thử lại sau ít phút!";
        }
    }
}