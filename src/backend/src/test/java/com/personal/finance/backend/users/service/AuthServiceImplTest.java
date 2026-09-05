package com.personal.finance.backend.users.service;

import com.personal.finance.backend.categories.service.CategoryService;
import com.personal.finance.backend.security.JwtUtil;
import com.personal.finance.backend.users.dto.request.ChangePasswordRequest;
import com.personal.finance.backend.users.dto.request.LoginRequest;
import com.personal.finance.backend.users.dto.request.RegisterRequest;
import com.personal.finance.backend.users.dto.response.AuthResponse;
import com.personal.finance.backend.users.dto.response.UserDTO;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.mapper.UserMapper;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.users.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockUser;
    private UserDTO mockUserDTO;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@example.com");
        mockUser.setPassword("encoded_password");
        mockUser.setRole(User.Role.USER);

        mockUserDTO = new UserDTO();
        mockUserDTO.setId(1L);
        mockUserDTO.setUsername("testuser");
    }

    @Test
    void register_ValidRequest_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("123456");
        request.setFullName("New User");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded_123456");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        authService.register(request);

        verify(userRepository, times(1)).save(any(User.class));
        verify(categoryService, times(1)).cloneAdminCategoriesForNewUser(any(User.class));
    }

    @Test
    void register_UsernameExists_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Tên đăng nhập đã tồn tại!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ValidCredentials_ReturnsAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("123456");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("123456", "encoded_password")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "testuser", "USER")).thenReturn("mock_jwt_token");
        when(userMapper.toDTO(mockUser)).thenReturn(mockUserDTO);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong_password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Sai tên đăng nhập hoặc mật khẩu!", exception.getMessage());
    }

    @Test
    void changePassword_ValidRequest_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old_password");
        request.setNewPassword("new_password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("old_password", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("new_password")).thenReturn("encoded_new_password");

        authService.changePassword(1L, request);

        assertEquals("encoded_new_password", mockUser.getPassword());
        verify(userRepository, times(1)).save(mockUser);
    }
}