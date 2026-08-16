package com.personal.finance.backend.notifications.service;

import com.personal.finance.backend.notifications.dto.response.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationDTO> getMyNotifications(Long userId, Pageable pageable);
    void markAsRead(Long id, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id, Long userId);

    void createSystemNotification(Long userId, String title, String content);
}