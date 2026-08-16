package com.personal.finance.backend.ai_assistant.service.impl;

import com.personal.finance.backend.ai_assistant.service.AiAssistantService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final ReportService reportService;
    private final WalletRepository walletRepository;
    private final RestTemplate restTemplate = new RestTemplate();

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
        return callOpenAiApi(systemInstruction, prompt.toString());
    }

    @Override
    public String chatWithAi(Long userId, String userMessage) {
        Double currentBalance = walletRepository.getTotalBalanceAccessibleByUser(userId);

        String systemInstruction = String.format(
                "Bạn là Trợ lý tài chính ảo thông minh. Người dùng hiện đang có tổng số dư là %,.0f VNĐ trong các ví. " +
                        "Hãy trả lời câu hỏi của họ một cách ngắn gọn, thân thiện và có tính chuyên môn tài chính.",
                currentBalance
        );

        return callOpenAiApi(systemInstruction, userMessage);
    }

    private String callOpenAiApi(String systemInstruction, String userPrompt) {
        String apiUrl = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> systemMessage = Map.of("role", "system", "content", systemInstruction);
        Map<String, Object> userMessage = Map.of("role", "user", "content", userPrompt);

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(systemMessage, userMessage),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("Lỗi khi gọi OpenAI: ", e);
            return "Trợ lý AI đang quá tải, vui lòng thử lại sau ít phút!";
        }
    }
}