package com.personal.finance.backend.importBatch.controller;

import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import com.personal.finance.backend.importBatch.service.ImportBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/import-batches")
@RequiredArgsConstructor
public class ImportBatchController {

    private final ImportBatchService importBatchService;

    @PostMapping("/preview")
    public ResponseEntity<Map<String, Object>> previewFile(
            @RequestParam("file") MultipartFile file) {

        String filename = file.getOriginalFilename();
        if (file.isEmpty() || filename == null || (!filename.toLowerCase().endsWith(".csv") && !filename.toLowerCase().endsWith(".xlsx") && !filename.toLowerCase().endsWith(".xls"))) {
            throw new RuntimeException("Vui lòng tải lên file định dạng .csv hoặc .xlsx / .xls");
        }

        List<String> headers = importBatchService.extractHeaders(file);
        return ResponseEntity.ok(Map.of(
                "filename", filename,
                "headers", headers
        ));
    }

    @PostMapping("/upload")
    public ResponseEntity<ImportBatchDTO> importFile(
            @RequestAttribute("userId") Long userId,
            @RequestParam("walletId") Long walletId,
            @RequestParam("dateCol") Integer dateCol,
            @RequestParam("amountCol") Integer amountCol,
            @RequestParam("descCol") Integer descCol,
            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(importBatchService.importData(userId, walletId, dateCol, amountCol, descCol, file));
    }
}