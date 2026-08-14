package com.personal.finance.backend.users.service;

import com.personal.finance.backend.users.dto.request.UpdateProfileRequest;
import com.personal.finance.backend.users.dto.response.UserDTO;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.mapper.UserMapper;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.users.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User mockUser;
    private UserDTO mockUserDTO;

    @BeforeEach
    void setUp() {

        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setFullName("Old Name");

        mockUserDTO = new UserDTO();
        mockUserDTO.setId(1L);
        mockUserDTO.setUsername("testuser");
        mockUserDTO.setFullName("Old Name");
    }

    // TE-04: Tên test mô tả rõ: TênHàm_ĐiềuKiện_KếtQuảMongĐợi
    @Test
    void getUserById_UserExists_ReturnsUserDTO() {

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userMapper.toDTO(mockUser)).thenReturn(mockUserDTO);


        UserDTO result = userService.getUserById(1L);


        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).findById(1L); // Đảm bảo repository được gọi đúng 1 lần
    }

    @Test
    void getUserById_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserById(99L);
        });

        assertEquals("Không tìm thấy người dùng!", exception.getMessage());
    }

    @Test
    void updateUser_ValidRequest_UpdatesAndReturnsDTO() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("New Name");
        request.setAvatar("new_avatar.png");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setFullName("New Name");
        when(userMapper.toDTO(any(User.class))).thenReturn(updatedDTO);

        // Act
        UserDTO result = userService.updateUser(1L, request);

        assertNotNull(result);
        assertEquals("New Name", result.getFullName());
        assertEquals("New Name", mockUser.getFullName());
        verify(userRepository, times(1)).save(mockUser);
    }
}