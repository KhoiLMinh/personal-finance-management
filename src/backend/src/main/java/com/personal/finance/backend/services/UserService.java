package com.personal.finance.backend.services;

import com.personal.finance.backend.dtos.request.UpdateProfileRequest;
import com.personal.finance.backend.dtos.response.UserDTO;
import com.personal.finance.backend.entities.User;

import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO updateUser(Long id, UpdateProfileRequest request);
    void deleteUser(Long id);
}
