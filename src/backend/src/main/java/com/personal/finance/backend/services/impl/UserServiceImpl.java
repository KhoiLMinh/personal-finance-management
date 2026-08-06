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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

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

    @Override
    public User findUserByUserName(String username){
        Optional<User> userOpt = this.userRepository.findByUsername(username);
        return userOpt.orElse(null);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        return userMapper.toDTO(user);
    }

}