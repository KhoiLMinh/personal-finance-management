package com.personal.finance.backend.services;
import com.personal.finance.backend.dtos.request.*;
import com.personal.finance.backend.dtos.response.*;
import com.personal.finance.backend.entities.User;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    void changePassword(Long id, ChangePasswordRequest request);


}
