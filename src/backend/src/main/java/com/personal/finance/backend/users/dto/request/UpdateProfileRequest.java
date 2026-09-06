package com.personal.finance.backend.users.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private MultipartFile avatar;
}