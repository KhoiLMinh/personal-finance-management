package com.personal.finance.backend.users.service;

import com.personal.finance.backend.users.dto.request.UpdateProfileRequest;
import com.personal.finance.backend.users.dto.response.UserDTO;
import com.personal.finance.backend.users.entity.User;

import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO updateUser(Long id, UpdateProfileRequest request);
    void deleteUser(String userCode);
    void toggleUserStatus(String userCode);
    User findUserByUserName(String username);
}