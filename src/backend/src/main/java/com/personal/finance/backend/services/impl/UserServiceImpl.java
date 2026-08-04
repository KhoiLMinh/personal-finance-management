package com.personal.finance.backend.services.impl;

import com.personal.finance.backend.dtos.request.UpdateProfileRequest;
import com.personal.finance.backend.dtos.response.UserDTO;
import com.personal.finance.backend.entities.User;
import com.personal.finance.backend.mappers.UserMapper;
import com.personal.finance.backend.repositories.UserRepository;
import com.personal.finance.backend.services.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    @Override
    public UserDTO getUserById(Long id) {
        return userMapper.toDTO(getUserEntity(id));
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UpdateProfileRequest request) {
        User user = getUserEntity(id);
        user.setFullName(request.getFullName());
        user.setAvatar(request.getAvatar());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }
        userRepository.deleteById(id);
    }
}