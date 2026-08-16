package com.personal.finance.backend.ai_assistant.controller;

import com.personal.finance.backend.ai_assistant.dto.request.ChatRequest;
import com.personal.finance.backend.ai_assistant.dto.response.AiResponseDTO;
import com.personal.finance.backend.ai_assistant.service.AiAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @GetMapping("/analyze-report")
    public ResponseEntity<AiResponseDTO> analyzeReport(
            @RequestAttribute("userId") Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDate today = LocalDate.now();
        if (endDate == null) endDate = today;
        if (startDate == null) startDate = today.withDayOfMonth(1);
        if (startDate.isAfter(endDate)) throw new RuntimeException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");

        String reply = aiAssistantService.analyzeReport(userId, startDate, endDate);
        return ResponseEntity.ok(new AiResponseDTO(reply));
    }


    @PostMapping("/chat")
    public ResponseEntity<AiResponseDTO> chatWithAssistant(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ChatRequest request) {

        String reply = aiAssistantService.chatWithAi(userId, request.getMessage());
        return ResponseEntity.ok(new AiResponseDTO(reply));
    }
}