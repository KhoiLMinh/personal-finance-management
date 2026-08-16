package com.personal.finance.backend.tools.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterestRequest {
    @NotNull(message = "Số tiền vay không được để trống")
    @Positive(message = "Số tiền vay phải lớn hơn 0")
    private Double principal;

    @NotNull(message = "Lãi suất không được để trống")
    @Positive(message = "Lãi suất phải lớn hơn 0")
    private Double annualRate;

    @NotNull(message = "Kỳ hạn không được để trống")
    @Min(value = 1, message = "Kỳ hạn vay ít nhất 1 tháng")
    private Integer months;

    @NotNull(message = "Vui lòng chọn loại tính lãi")
    private InterestType type;

    public enum InterestType {
        FLAT, REDUCING
    }
}