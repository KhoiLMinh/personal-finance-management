package com.personal.finance.backend.importBatch.service;

import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImportBatchService {
    List<String> extractHeaders(MultipartFile file);
    ImportBatchDTO importData(Long userId, Long walletId, int dateCol, int amountCol, int descCol, MultipartFile file);
}