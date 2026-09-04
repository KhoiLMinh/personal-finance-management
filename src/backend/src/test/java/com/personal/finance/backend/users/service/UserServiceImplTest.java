package com.personal.finance.backend.users.service;

import com.personal.finance.backend.common.service.CloudinaryService;
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
import org.springframework.mock.web.MockMultipartFile;

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

    @Mock
    private CloudinaryService cloudinaryService;

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

    @Test
    void getUserById_UserExists_ReturnsUserDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userMapper.toDTO(mockUser)).thenReturn(mockUserDTO);

        UserDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void getUserById_UserNotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserById(99L);
        });

        assertEquals("Không tìm thấy người dùng!", exception.getMessage());
    }

    @Test
    void updateUser_WithAvatar_UpdatesAndReturnsDTO() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("New Name");

        MockMultipartFile mockAvatar = new MockMultipartFile(
                "avatar",
                "avatar.png",
                "image/png",
                "fake image content".getBytes()
        );
        request.setAvatar(mockAvatar);

        String mockCloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/v12345/avatar.png";

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(cloudinaryService.uploadImage(mockAvatar)).thenReturn(mockCloudinaryUrl);

        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setFullName("New Name");
        updatedDTO.setAvatar(mockCloudinaryUrl);
        when(userMapper.toDTO(any(User.class))).thenReturn(updatedDTO);

        UserDTO result = userService.updateUser(1L, request);

        assertNotNull(result);
        assertEquals("New Name", result.getFullName());
        assertEquals("New Name", mockUser.getFullName());
        assertEquals(mockCloudinaryUrl, mockUser.getAvatar());

        verify(cloudinaryService, times(1)).uploadImage(mockAvatar); 
    }

    @Test
    void updateUser_WithoutAvatar_DoesNotCallCloudinary() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("New Name Only");
        request.setAvatar(null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setFullName("New Name Only");
        when(userMapper.toDTO(any(User.class))).thenReturn(updatedDTO);

        UserDTO result = userService.updateUser(1L, request);

        assertEquals("New Name Only", mockUser.getFullName());

        verify(cloudinaryService, never()).uploadImage(any());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    void toggleUserStatus_ValidUserCode_TogglesSuccessfully() {
        User targetUser = new User();
        targetUser.setId(2L);
        targetUser.setUserCode("mock-uuid-1234");
        targetUser.setActive(true);

        when(userRepository.findByUserCode("mock-uuid-1234")).thenReturn(Optional.of(targetUser));

        userService.toggleUserStatus("mock-uuid-1234");

        assertFalse(targetUser.isActive());
        verify(userRepository, times(1)).save(targetUser);
    }

    @Test
    void toggleUserStatus_RootAdmin_ThrowsException() {
        User rootAdmin = new User();
        rootAdmin.setId(1L); // ID = 1 là cấm khóa
        rootAdmin.setUserCode("root-uuid");

        when(userRepository.findByUserCode("root-uuid")).thenReturn(Optional.of(rootAdmin));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.toggleUserStatus("root-uuid");
        });

        assertEquals("Không thể khóa tài khoản Quản trị viên gốc!", exception.getMessage());
    }
}