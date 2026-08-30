package com.personal.finance.backend.settings.controller;

import com.personal.finance.backend.settings.dto.SystemSettingDTO;
import com.personal.finance.backend.settings.entity.SystemSetting;
import com.personal.finance.backend.settings.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingRepository systemSettingRepository;

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(systemSettingRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{key}")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable String key,
            @RequestBody SystemSettingDTO dto) {

        SystemSetting setting = systemSettingRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình!"));

        setting.setValue(dto.getValue());
        return ResponseEntity.ok(systemSettingRepository.save(setting));
    }
}