package com.personal.finance.backend.notifications.controller;

import com.personal.finance.backend.notifications.dto.response.NotificationDTO;
import com.personal.finance.backend.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getMyNotifications(
            @RequestAttribute("userId") Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userId, pageable));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestAttribute("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }
}