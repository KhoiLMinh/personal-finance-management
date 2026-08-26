package com.personal.finance.backend.users.controller;

import com.personal.finance.backend.users.dto.request.GoogleAuthRequest;
import com.personal.finance.backend.users.service.AuthService;
import com.personal.finance.backend.users.dto.request.ChangePasswordRequest;
import com.personal.finance.backend.users.dto.request.LoginRequest;
import com.personal.finance.backend.users.dto.request.RegisterRequest;
import com.personal.finance.backend.users.dto.response.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    //FR-01
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        this.authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký thành công!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(this.authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(this.authService.googleLogin(request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        this.authService.changePassword(userId, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}