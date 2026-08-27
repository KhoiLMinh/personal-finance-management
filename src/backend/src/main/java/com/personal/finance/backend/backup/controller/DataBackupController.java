package com.personal.finance.backend.backup.controller;

import com.personal.finance.backend.backup.service.DataBackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataBackupController {

    private final DataBackupService dataBackupService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData(@RequestAttribute("userId") Long userId) {
        byte[] jsonData = dataBackupService.exportUserData(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"personal_finance_backup.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonData);
    }

    @PostMapping(value = "/restore", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> restoreData(
            @RequestAttribute("userId") Long userId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().endsWith(".json")) {
            throw new RuntimeException("Vui lòng tải lên file sao lưu định dạng .json hợp lệ!");
        }

        dataBackupService.importUserData(userId, file);
        return ResponseEntity.ok("Phục hồi dữ liệu thành công!");
    }
}