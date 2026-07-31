package com.personal.finance.backend.services;
import com.personal.finance.backend.dtos.request.*;
import com.personal.finance.backend.dtos.response.*;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    UserDTO getProfile(Long id);
    void changePassword(Long id, ChangePasswordRequest request);
    void updateProfile(Long id, UpdateProfileRequest request);
}
