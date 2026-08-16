package com.personal.finance.backend.importBatch.controller;

import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import com.personal.finance.backend.importBatch.service.ImportBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/import-batches")
@RequiredArgsConstructor
public class ImportBatchController {

    private final ImportBatchService importBatchService;

    @PostMapping("/csv")
    public ResponseEntity<ImportBatchDTO> importCsv(
            @RequestAttribute("userId") Long userId,
            @RequestParam("walletId") Long walletId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            throw new RuntimeException("Vui lòng tải lên file định dạng .csv");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(importBatchService.importCsv(userId, walletId, file));
    }
}