package com.personal.finance.backend.tools.controller;

import com.personal.finance.backend.tools.dto.request.InterestRequest;
import com.personal.finance.backend.tools.dto.response.ToolResponse;
import com.personal.finance.backend.tools.service.ToolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;

    @PostMapping("/loan-calculator")
    public ResponseEntity<ToolResponse> calculateLoanInterest(
            @Valid @RequestBody InterestRequest request) {

        var result = toolService.calculateLoanInterest(request);

        return ResponseEntity.ok(ToolResponse.builder()
                .result(result)
                .message("Tính toán lịch trả nợ thành công!")
                .build());
    }

    @GetMapping("/currency-converter")
    public ResponseEntity<ToolResponse> convertCurrency(
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "VND") String to,
            @RequestParam(defaultValue = "1") Double amount) {

        var result = toolService.convertCurrency(from, to, amount);

        return ResponseEntity.ok(ToolResponse.builder()
                .result(result)
                .message("Lấy tỷ giá real-time thành công!")
                .build());
    }
}