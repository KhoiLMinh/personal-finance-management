package com.personal.finance.backend.services.impl;

import com.personal.finance.backend.entities.User;
import com.personal.finance.backend.repositories.UserRepository;
import com.personal.finance.backend.services.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.personal.finance.backend.dtos.request.*;
import com.personal.finance.backend.dtos.response.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole().name());
        return dto;
    }

    private User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }


    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        String token = "jwt";
        return new AuthResponse(token, mapToUserDTO(user));
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        String emailFromGoogle = "email";

        User user = userRepository.findByEmail(emailFromGoogle).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(emailFromGoogle);
            newUser.setUsername(emailFromGoogle);
            newUser.setPassword(passwordEncoder.encode("OAUTH2"));
            return userRepository.save(newUser);
        });

        String token = "jwt";
        return new AuthResponse(token, mapToUserDTO(user));
    }

    @Override
    public UserDTO getProfile(Long id) {
        User user = getUserById(id);
        return mapToUserDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = getUserById(id);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateProfile(Long id, UpdateProfileRequest request) {
        User user = getUserById(id);
         user.setFullName(request.getFullName());
         user.setAvatar(request.getAvatar());
        userRepository.save(user);
    }
}
