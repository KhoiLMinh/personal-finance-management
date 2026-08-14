package com.personal.finance.backend.importBatch.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ImportBatchDTO {
    private Long id;
    private String fileName;
    private Integer totalRows;
    private Integer successRows;
    private Integer duplicatedRows;
    private boolean status;
    private LocalDateTime createAt;
}