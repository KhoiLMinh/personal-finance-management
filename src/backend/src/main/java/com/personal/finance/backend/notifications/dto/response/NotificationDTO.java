package com.personal.finance.backend.notifications.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long id;
    private String title;
    private String content;
    private boolean isRead;
    private LocalDateTime createAt;
}