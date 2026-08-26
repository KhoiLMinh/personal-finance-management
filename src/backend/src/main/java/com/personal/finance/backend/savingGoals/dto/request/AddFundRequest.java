package com.personal.finance.backend.savingGoals.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddFundRequest {
    @NotNull(message = "Số tiền nộp thêm không được để trống")
    @Positive(message = "Số tiền nộp thêm phải lớn hơn 0")
    private Double amount;

    @NotNull(message = "Vui lòng chọn ví để trích tiền")
    private Long walletId;
}