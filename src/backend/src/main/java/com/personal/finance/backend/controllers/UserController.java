package com.personal.finance.backend.controllers;

import com.personal.finance.backend.dtos.request.UpdateProfileRequest;
import com.personal.finance.backend.dtos.response.UserDTO;
import com.personal.finance.backend.entities.User;
import com.personal.finance.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(this.userService.getAllUsers());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(this.userService.getUserById(userId));
    }

    @PatchMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        this.userService.updateUser(userId, request);
        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        this.userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}