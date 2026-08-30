package com.personal.finance.backend.settings.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SystemSettingDTO {
    private String key;
    private String value;
    private String description;
}