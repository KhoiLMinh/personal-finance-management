package com.personal.finance.backend.importBatch.service;

import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ImportBatchService {
    ImportBatchDTO importCsv(Long userId, Long walletId, MultipartFile file);
}