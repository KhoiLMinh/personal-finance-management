package com.personal.finance.backend.configs;

import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo tài khoản Admin mặc định
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            // SE-02: Mã hóa mật khẩu trước khi lưu vào seed data
            admin.setPassword(passwordEncoder.encode("Demo@123"));
            admin.setFullName("Quản Trị Viên");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            log.info("Đã tạo tài khoản mặc định - Role ADMIN: admin / Demo@123");
        }

        if (!userRepository.existsByUsername("user_demo")) {
            User user = new User();
            user.setUsername("user_demo");
            user.setEmail("user_demo@example.com");
            user.setPassword(passwordEncoder.encode("Demo@123"));
            user.setFullName("Người Dùng Test");
            user.setRole(User.Role.USER);
            userRepository.save(user);
            log.info("Đã tạo tài khoản mặc định - Role USER: user_demo / Demo@123");
        }
    }
}