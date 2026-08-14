package com.personal.finance.backend.importBatch.mapper;

import com.personal.finance.backend.importBatch.dto.response.ImportBatchDTO;
import com.personal.finance.backend.importBatch.entity.ImportBatch;
import org.springframework.stereotype.Component;

@Component
public class ImportBatchMapper {
    public ImportBatchDTO toDTO(ImportBatch batch) {
        if (batch == null) return null;

        ImportBatchDTO dto = new ImportBatchDTO();
        dto.setId(batch.getId());
        dto.setFileName(batch.getFileName());
        dto.setTotalRows(batch.getTotalRows());
        dto.setSuccessRows(batch.getSuccessRows());
        dto.setDuplicatedRows(batch.getDuplicatedRows());
        dto.setStatus(batch.isStatus());
        dto.setCreateAt(batch.getCreateAt());

        return dto;
    }
}