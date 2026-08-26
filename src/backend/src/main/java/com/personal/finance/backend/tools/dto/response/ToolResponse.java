package com.personal.finance.backend.tools.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ToolResponse {
    private Object result;
    private String message;
}