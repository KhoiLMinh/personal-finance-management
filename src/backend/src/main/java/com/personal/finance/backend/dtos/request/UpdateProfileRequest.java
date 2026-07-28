package com.personal.finance.backend.dtos.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String avatar;
}