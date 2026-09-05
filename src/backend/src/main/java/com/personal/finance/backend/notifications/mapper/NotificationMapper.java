package com.personal.finance.backend.notifications.mapper;

import com.personal.finance.backend.notifications.dto.response.NotificationDTO;
import com.personal.finance.backend.notifications.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public NotificationDTO toDTO(Notification notification) {
        if (notification == null) return null;

        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setRead(notification.isRead());
        dto.setPriority(notification.getPriority());
        dto.setCreateAt(notification.getCreateAt());
        return dto;
    }
}