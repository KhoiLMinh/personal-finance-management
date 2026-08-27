package com.personal.finance.backend.backup.service;

import org.springframework.web.multipart.MultipartFile;

public interface DataBackupService {
    byte[] exportUserData(Long userId);
    void importUserData(Long userId, MultipartFile file);
}