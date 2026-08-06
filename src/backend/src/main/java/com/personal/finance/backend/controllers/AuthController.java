package com.personal.finance.backend.controllers;

import com.personal.finance.backend.dtos.request.*;
import com.personal.finance.backend.dtos.response.*;
import com.personal.finance.backend.entities.User;
import com.personal.finance.backend.services.AuthService;
import com.personal.finance.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

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

//    @PostMapping("/google")
//    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
//        return ResponseEntity.ok(this.authService.googleLogin(request));
//    }


    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        this.authService.changePassword(userId, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}