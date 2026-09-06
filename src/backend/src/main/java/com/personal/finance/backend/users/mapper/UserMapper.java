package com.personal.finance.backend.users.mapper;

import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.dto.response.UserDTO;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserCode(user.getUserCode());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setProvider(user.getProvider() != null ? user.getProvider().name() : "LOCAL");
        dto.setCreateAt(user.getCreateAt());
        dto.setUpdateAt(user.getUpdateAt());
        return dto;
    }
}