package com.personal.finance.backend.users.service;
import com.personal.finance.backend.users.dto.request.ChangePasswordRequest;
import com.personal.finance.backend.users.dto.request.GoogleAuthRequest;
import com.personal.finance.backend.users.dto.request.LoginRequest;
import com.personal.finance.backend.users.dto.request.RegisterRequest;
import com.personal.finance.backend.users.dto.response.AuthResponse;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    void changePassword(Long id, ChangePasswordRequest request);


}
