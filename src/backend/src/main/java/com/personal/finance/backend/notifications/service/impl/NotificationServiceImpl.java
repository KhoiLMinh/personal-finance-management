package com.personal.finance.backend.notifications.service.impl;

import com.personal.finance.backend.notifications.dto.response.NotificationDTO;
import com.personal.finance.backend.notifications.entity.Notification;
import com.personal.finance.backend.notifications.mapper.NotificationMapper;
import com.personal.finance.backend.notifications.repository.NotificationRepository;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public Page<NotificationDTO> getMyNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findMyPriorityNotifications(userId, pageable).map(notificationMapper :: toDTO);
    }

    @Override
    @Transactional
    public void markAsRead(Long id, Long userId) {
        int updatedRows = notificationRepository.markAsRead(id, userId);
        if (updatedRows == 0) {
            log.info("Thông báo ID {} không tồn tại, không thuộc user {} hoặc đã được đọc trước đó.", id, userId);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        int updatedRows = notificationRepository.markAllAsRead(userId);
        log.info("User {} đã đánh dấu {} thông báo là đã đọc.", userId, updatedRows);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo hoặc truy cập trái phép!"));

        notificationRepository.delete(notification);
        log.info("Xoá thành công thông báo ID {} bởi user {}.", id, userId);
    }

    @Override
    @Transactional
    public void createSystemNotification(Long userId, String title, String content, Integer priority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để gửi thông báo!"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setPriority(priority);
        notification.setRead(false);

        notificationRepository.save(notification);
        log.info("Đã tạo cảnh báo hệ thống cho user {}: {}", userId, title);
    }
}