package com.personal.finance.backend.tools.service.impl;

import com.personal.finance.backend.tools.dto.request.InterestRequest;
import com.personal.finance.backend.tools.service.ToolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ToolServiceImpl implements ToolService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, Object> calculateLoanInterest(InterestRequest request) {
        double principal = request.getPrincipal();
        double monthlyRate = (request.getAnnualRate() / 100) / 12;
        int months = request.getMonths();

        double totalInterest = 0;
        double totalPayment = 0;
        List<Map<String, Object>> paymentSchedule = new ArrayList<>();

        if (request.getType() == InterestRequest.InterestType.FLAT) {
            double monthlyInterest = principal * monthlyRate;
            double monthlyPrincipal = principal / months;
            double monthlyTotal = monthlyPrincipal + monthlyInterest;

            totalInterest = monthlyInterest * months;
            totalPayment = principal + totalInterest;

            for (int i = 1; i <= months; i++) {
                paymentSchedule.add(Map.of(
                        "month", i,
                        "principalPaid", monthlyPrincipal,
                        "interestPaid", monthlyInterest,
                        "totalPayment", monthlyTotal,
                        "remainingBalance", principal - (monthlyPrincipal * i)
                ));
            }
        } else {
            double emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
                    / (Math.pow(1 + monthlyRate, months) - 1);

            totalPayment = emi * months;
            totalInterest = totalPayment - principal;

            double remainingBalance = principal;
            for (int i = 1; i <= months; i++) {
                double interestPaid = remainingBalance * monthlyRate;
                double principalPaid = emi - interestPaid;
                remainingBalance -= principalPaid;

                paymentSchedule.add(Map.of(
                        "month", i,
                        "principalPaid", principalPaid,
                        "interestPaid", interestPaid,
                        "totalPayment", emi,
                        "remainingBalance", Math.max(0, remainingBalance)
                ));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("loanAmount", principal);
        result.put("totalInterest", totalInterest);
        result.put("totalPayment", totalPayment);
        result.put("monthlyPaymentInfo", request.getType() == InterestRequest.InterestType.FLAT ? "Cố định hàng tháng" : "Trả góp đều (EMI)");
        result.put("schedule", paymentSchedule);

        return result;
    }


    @Override
    public Map<String, Object> convertCurrency(String from, String to, Double amount) {
        from = from.toUpperCase();
        to = to.toUpperCase();

        String url = "https://open.er-api.com/v6/latest/" + from;

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "success".equals(response.get("result"))) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");

                if (!rates.containsKey(to)) {
                    throw new RuntimeException("Không hỗ trợ đồng tiền đích: " + to);
                }

                double exchangeRate = rates.get(to);
                double convertedAmount = amount * exchangeRate;

                return Map.of(
                        "fromCurrency", from,
                        "toCurrency", to,
                        "originalAmount", amount,
                        "exchangeRate", exchangeRate,
                        "convertedAmount", convertedAmount,
                        "lastUpdate", response.get("time_last_update_utc")
                );
            } else {
                throw new RuntimeException("Lỗi từ máy chủ tỷ giá!");
            }
        } catch (Exception e) {
            log.error("Lỗi khi chuyển đổi ngoại tệ: ", e);
            throw new RuntimeException("Không thể lấy tỷ giá lúc này. Vui lòng kiểm tra lại mã tiền tệ (VD: USD, VND, EUR) hoặc thử lại sau.");
        }
    }
}