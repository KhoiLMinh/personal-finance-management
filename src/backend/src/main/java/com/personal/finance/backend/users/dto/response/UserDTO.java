package com.personal.finance.backend.users.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserDTO {
    private Long id;
    private String userCode;
    private String username;
    private String email;
    private String fullName;
    private String avatar;
    private String role;
    private String provider;
    private boolean active;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}