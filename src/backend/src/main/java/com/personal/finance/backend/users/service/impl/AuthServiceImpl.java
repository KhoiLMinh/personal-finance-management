package com.personal.finance.backend.users.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.personal.finance.backend.categories.service.CategoryService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.users.service.AuthService;
import com.personal.finance.backend.users.dto.request.ChangePasswordRequest;
import com.personal.finance.backend.users.dto.request.GoogleAuthRequest;
import com.personal.finance.backend.users.dto.request.LoginRequest;
import com.personal.finance.backend.users.dto.request.RegisterRequest;
import com.personal.finance.backend.users.dto.response.AuthResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.personal.finance.backend.users.mapper.UserMapper;
import com.personal.finance.backend.security.JwtUtil;

import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final CategoryService categoryService;

    @Value("${app.google.client-id}")
    private String googleClientId;

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
        user.setFullName(request.getFullName());
        user = userRepository.save(user);
        categoryService.cloneAdminCategoriesForNewUser(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return new AuthResponse(token, userMapper.toDTO(user));
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getGoogleToken());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);

                    String baseUsername = email.split("@")[0];
                    String uniqueSuffix = UUID.randomUUID().toString().substring(0, 5);
                    newUser.setUsername(baseUsername + "_" + uniqueSuffix);

                    newUser.setFullName(name);
                    newUser.setAvatar(pictureUrl);

                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole(User.Role.USER);
                    newUser.setProvider(User.Provider.GOOGLE);
                    log.info("Tạo mới tài khoản qua Google cho email: {}", email);
                    newUser = userRepository.save(newUser);
                    categoryService.cloneAdminCategoriesForNewUser(newUser);
                    return newUser;
                });

                String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
                return new AuthResponse(token, userMapper.toDTO(user));
            } else {
                log.warn("Xác thực Google Token thất bại: Token null hoặc không khớp chữ ký");
                throw new RuntimeException("Token Google không hợp lệ!");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý đăng nhập Google: ", e);
            throw new RuntimeException("Xác thực Google thất bại. Vui lòng thử lại!");
        }
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        if (user.getProvider() == User.Provider.GOOGLE) {
            throw new RuntimeException("Tài khoản liên kết với Google không hỗ trợ đổi mật khẩu!");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
