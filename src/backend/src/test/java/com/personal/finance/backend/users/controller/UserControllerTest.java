package com.personal.finance.backend.users.controller;

import com.personal.finance.backend.security.JwtUtil;
import com.personal.finance.backend.users.dto.request.UpdateProfileRequest;
import com.personal.finance.backend.users.dto.response.UserDTO;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.users.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void getProfile_ReturnsUserDTOAndStatus200() throws Exception {
        UserDTO mockDTO = new UserDTO();
        mockDTO.setId(1L);
        mockDTO.setUsername("testuser");
        mockDTO.setFullName("Nguyen Van A");

        when(userService.getUserById(1L)).thenReturn(mockDTO);

        mockMvc.perform(get("/api/v1/users/profile")
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.fullName").value("Nguyen Van A"));
    }

    @Test
    void updateProfile_ValidRequest_ReturnsStatus200() throws Exception {
        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setFullName("New Name");

        when(userService.updateUser(eq(1L), any(UpdateProfileRequest.class))).thenReturn(updatedDTO);

        mockMvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PATCH, "/api/v1/users/profile")
                        .param("fullName", "New Name")
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Cập nhật thông tin thành công!"));
    }

    @Test
    void toggleUserStatus_ValidRequest_ReturnsStatus200() throws Exception {
        doNothing().when(userService).toggleUserStatus("mock-uuid-1234");

        mockMvc.perform(MockMvcRequestBuilders.patch("/api/v1/users/mock-uuid-1234/toggle-status")
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Cập nhật trạng thái người dùng thành công!"));
    }
}