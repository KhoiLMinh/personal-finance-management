package com.personal.finance.backend.mappers;

import com.personal.finance.backend.dtos.response.*;
import com.personal.finance.backend.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole().name());
        dto.setCreateAt(user.getCreateAt());
        dto.setUpdateAt(user.getUpdateAt());
        return dto;
    }
}