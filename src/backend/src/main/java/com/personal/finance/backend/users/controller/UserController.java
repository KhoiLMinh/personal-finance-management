package com.personal.finance.backend.users.controller;

import com.personal.finance.backend.users.dto.request.UpdateProfileRequest;
import com.personal.finance.backend.users.dto.response.UserDTO;
import com.personal.finance.backend.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    //FR-15
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(this.userService.getAllUsers());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(this.userService.getUserById(userId));
    }

    @PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateProfile(
            @RequestAttribute("userId") Long userId,
            @ModelAttribute UpdateProfileRequest request) {
        this.userService.updateUser(userId, request);
        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }
    //FR-15
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userCode}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userCode) {
        this.userService.deleteUser(userCode);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userCode}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable String userCode) {
        this.userService.toggleUserStatus(userCode);
        return ResponseEntity.ok("Cập nhật trạng thái người dùng thành công!");
    }
}