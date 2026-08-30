package com.personal.finance.backend.ai_assistant.service;

import com.personal.finance.backend.categories.entity.Category;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AiAssistantService {
    String analyzeReport(Long userId, LocalDate startDate, LocalDate endDate);
    String chatWithAi(Long userId, String userMessage);
    Map<String, Long> categorizeTransactionsBatch(List<String> descriptions, List<Category> userCategories);
}