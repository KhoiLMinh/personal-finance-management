package com.personal.finance.backend.tools.service;

import com.personal.finance.backend.tools.dto.request.InterestRequest;
import java.util.Map;

public interface ToolService {
    Map<String, Object> calculateLoanInterest(InterestRequest request);
    Map<String, Object> convertCurrency(String from, String to, Double amount);
}