package com.personal.finance.backend.notifications.service;

import com.personal.finance.backend.notifications.dto.response.NotificationDTO;
import com.personal.finance.backend.notifications.entity.Notification;
import com.personal.finance.backend.notifications.mapper.NotificationMapper;
import com.personal.finance.backend.notifications.repository.NotificationRepository;
import com.personal.finance.backend.notifications.service.impl.NotificationServiceImpl;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User mockUser;
    private Notification mockNotification;
    private NotificationDTO mockNotificationDTO;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        mockNotification = new Notification();
        mockNotification.setId(10L);
        mockNotification.setTitle("Cảnh báo ngân sách");
        mockNotification.setContent("Bạn đã tiêu quá 80% ngân sách.");
        mockNotification.setRead(false);
        mockNotification.setPriority(1);
        mockNotification.setUser(mockUser);

        mockNotificationDTO = new NotificationDTO();
        mockNotificationDTO.setId(10L);
        mockNotificationDTO.setTitle("Cảnh báo ngân sách");
        mockNotificationDTO.setRead(false);
        mockNotificationDTO.setPriority(1);
    }

    @Test
    void getMyNotifications_UsesPriorityQuery() {
        Page<Notification> page = new PageImpl<>(List.of(mockNotification));
        when(notificationRepository.findMyPriorityNotifications(eq(1L), any(Pageable.class))).thenReturn(page);
        when(notificationMapper.toDTO(mockNotification)).thenReturn(mockNotificationDTO);

        Page<NotificationDTO> result = notificationService.getMyNotifications(1L, Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(10L, result.getContent().get(0).getId());
        verify(notificationRepository, times(1)).findMyPriorityNotifications(eq(1L), any(Pageable.class));
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.markAsRead(10L, 1L)).thenReturn(1);

        notificationService.markAsRead(10L, 1L);

        verify(notificationRepository, times(1)).markAsRead(10L, 1L);
    }

    @Test
    void markAllAsRead_Success() {
        when(notificationRepository.markAllAsRead(1L)).thenReturn(5);

        notificationService.markAllAsRead(1L);

        verify(notificationRepository, times(1)).markAllAsRead(1L);
    }

    @Test
    void deleteNotification_IsOwner_Success() {
        when(notificationRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockNotification));

        notificationService.deleteNotification(10L, 1L);

        verify(notificationRepository, times(1)).delete(mockNotification);
    }

    @Test
    void deleteNotification_NotOwnerOrNotFound_ThrowsException() {
        Long hackerId = 99L;
        when(notificationRepository.findByIdAndUserId(10L, hackerId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.deleteNotification(10L, hackerId);
        });

        assertEquals("Không tìm thấy thông báo hoặc truy cập trái phép!", exception.getMessage());
        verify(notificationRepository, never()).delete(any());
    }

    @Test
    void createSystemNotification_WithPriority_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        notificationService.createSystemNotification(1L, "Test Title", "Test Content", 2);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification savedNoti = captor.getValue();
        assertEquals("Test Title", savedNoti.getTitle());
        assertEquals("Test Content", savedNoti.getContent());
        assertEquals(2, savedNoti.getPriority()); // Đảm bảo lưu đúng mức độ ưu tiên
        assertFalse(savedNoti.isRead());
    }

    @Test
    void createSystemNotification_UserNotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.createSystemNotification(99L, "Title", "Content", 1);
        });

        assertEquals("Không tìm thấy người dùng để gửi thông báo!", exception.getMessage());
        verify(notificationRepository, never()).save(any());
    }
}