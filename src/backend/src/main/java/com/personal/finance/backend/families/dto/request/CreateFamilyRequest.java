package com.personal.finance.backend.families.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateFamilyRequest {
    @NotBlank
    private String name;
}