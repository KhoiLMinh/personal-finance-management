package com.personal.finance.backend.ai_assistant.service;

import java.time.LocalDate;

public interface AiAssistantService {
    String analyzeReport(Long userId, LocalDate startDate, LocalDate endDate);
    String chatWithAi(Long userId, String userMessage);
}