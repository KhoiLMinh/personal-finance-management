package com.personal.finance.backend.families.service;

import com.personal.finance.backend.families.dto.request.CreateFamilyRequest;
import com.personal.finance.backend.families.dto.request.JoinFamilyRequest;
import com.personal.finance.backend.families.dto.request.UpdateMemberRoleRequest;
import com.personal.finance.backend.families.dto.response.FamilyDTO;
import com.personal.finance.backend.families.dto.response.FamilyMemberDTO;
import com.personal.finance.backend.families.entity.Family;
import com.personal.finance.backend.families.entity.FamilyMember;
import com.personal.finance.backend.families.mapper.FamilyMapper;
import com.personal.finance.backend.families.repository.FamilyMemberRepository;
import com.personal.finance.backend.families.repository.FamilyRepository;
import com.personal.finance.backend.families.service.impl.FamilyServiceImpl;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.repository.WalletMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FamilyServiceImplTest {

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyMapper familyMapper;

    @Mock
    private WalletMemberRepository walletMemberRepository;

    @InjectMocks
    private FamilyServiceImpl familyService;

    private User mockOwner;
    private User mockMemberUser;
    private Family mockFamily;
    private FamilyMember mockFamilyMember;
    private FamilyDTO mockFamilyDTO;

    @BeforeEach
    void setUp() {
        mockOwner = new User();
        mockOwner.setId(1L);
        mockOwner.setUsername("owner");

        mockMemberUser = new User();
        mockMemberUser.setId(2L);
        mockMemberUser.setUsername("member");

        mockFamily = new Family();
        mockFamily.setId(10L);
        mockFamily.setName("Gia đình vui vẻ");
        mockFamily.setInviteCode("ABC123XY");
        mockFamily.setOwner(mockOwner);

        mockFamilyMember = new FamilyMember();
        mockFamilyMember.setId(100L);
        mockFamilyMember.setFamily(mockFamily);
        mockFamilyMember.setUser(mockMemberUser);
        mockFamilyMember.setRole(FamilyMember.MemberRole.MEMBER);

        mockFamilyDTO = new FamilyDTO();
        mockFamilyDTO.setId(10L);
        mockFamilyDTO.setName("Gia đình vui vẻ");
    }

    @Test
    void createFamily_ValidRequest_Success() {
        CreateFamilyRequest request = new CreateFamilyRequest();
        request.setName("Gia đình mới");

        when(familyRepository.findByOwnerId(1L)).thenReturn(Optional.empty());
        when(familyMemberRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockOwner));
        when(familyRepository.existsByInviteCode(anyString())).thenReturn(false);
        when(familyRepository.save(any(Family.class))).thenReturn(mockFamily);
        when(familyMapper.toDTO(any(Family.class))).thenReturn(mockFamilyDTO);

        FamilyDTO result = familyService.createFamily(1L, request);

        assertNotNull(result);
        assertEquals("Gia đình vui vẻ", result.getName());
        verify(familyRepository, times(1)).save(any(Family.class));
        verify(familyMemberRepository, times(1)).save(any(FamilyMember.class));
    }

    @Test
    void createFamily_UserAlreadyInFamily_ThrowsException() {
        CreateFamilyRequest request = new CreateFamilyRequest();
        when(familyRepository.findByOwnerId(1L)).thenReturn(Optional.of(mockFamily));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> familyService.createFamily(1L, request));

        assertEquals("Bạn đã thuộc một gia đình khác, không thể tạo/tham gia gia đình mới!", exception.getMessage());
    }

    @Test
    void joinFamily_ValidCode_Success() {
        JoinFamilyRequest request = new JoinFamilyRequest();
        request.setInviteCode("ABC123XY");

        when(familyRepository.findByOwnerId(2L)).thenReturn(Optional.empty());
        when(familyMemberRepository.findByUserId(2L)).thenReturn(Optional.empty());
        when(familyRepository.findByInviteCode("ABC123XY")).thenReturn(Optional.of(mockFamily));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockMemberUser));
        when(familyMapper.toDTO(mockFamily)).thenReturn(mockFamilyDTO);

        FamilyDTO result = familyService.joinFamily(2L, request);

        assertNotNull(result);
        verify(familyMemberRepository, times(1)).save(any(FamilyMember.class));
    }

    @Test
    void joinFamily_InvalidCode_ThrowsException() {
        JoinFamilyRequest request = new JoinFamilyRequest();
        request.setInviteCode("SAICODE");

        when(familyRepository.findByOwnerId(2L)).thenReturn(Optional.empty());
        when(familyMemberRepository.findByUserId(2L)).thenReturn(Optional.empty());
        when(familyRepository.findByInviteCode("SAICODE")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> familyService.joinFamily(2L, request));
        assertEquals("Mã mời không hợp lệ!", exception.getMessage());
    }

    @Test
    void leaveFamily_IsMember_Success() {
        when(familyMemberRepository.findByUserId(2L)).thenReturn(Optional.of(mockFamilyMember));

        familyService.leaveFamily(2L);

        verify(walletMemberRepository, times(1)).revokeAllSharingForUser(2L);
        verify(familyMemberRepository, times(1)).delete(mockFamilyMember);
    }

    @Test
    void leaveFamily_IsOwner_ThrowsException() {
        FamilyMember ownerMember = new FamilyMember();
        ownerMember.setFamily(mockFamily);
        ownerMember.setUser(mockOwner);

        when(familyMemberRepository.findByUserId(1L)).thenReturn(Optional.of(ownerMember));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> familyService.leaveFamily(1L));
        assertEquals("Chủ gia đình không thể tự rời đi. Hãy xoá gia đình nếu muốn dừng sử dụng!", exception.getMessage());
    }

    @Test
    void deleteFamily_IsOwner_Success() {
        when(familyRepository.findById(10L)).thenReturn(Optional.of(mockFamily));

        familyService.deleteFamily(10L, 1L);

        verify(walletMemberRepository, times(1)).revokeAllSharingForFamily(10L, 1L);
        verify(familyRepository, times(1)).delete(mockFamily);
    }

    @Test
    void deleteFamily_NotOwner_ThrowsException() {
        when(familyRepository.findById(10L)).thenReturn(Optional.of(mockFamily));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> familyService.deleteFamily(10L, 2L));
        assertEquals("Chỉ chủ gia đình mới có quyền thực hiện thao tác này!", exception.getMessage());
    }

    @Test
    void getMembers_IsMember_Success() {
        when(familyRepository.findById(10L)).thenReturn(Optional.of(mockFamily));
        when(familyMemberRepository.findByUserId(2L)).thenReturn(Optional.of(mockFamilyMember));

        Page<FamilyMember> memberPage = new PageImpl<>(List.of(mockFamilyMember));
        when(familyMemberRepository.findAllByFamilyId(eq(10L), any(Pageable.class))).thenReturn(memberPage);
        when(familyMapper.toDTO(mockFamilyMember)).thenReturn(new FamilyMemberDTO());

        Page<FamilyMemberDTO> result = familyService.getMembers(10L, 2L, Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void updateMemberRole_IsOwner_Success() {
        UpdateMemberRoleRequest request = new UpdateMemberRoleRequest();
        request.setRole(FamilyMember.MemberRole.MANAGER);

        when(familyRepository.findById(10L)).thenReturn(Optional.of(mockFamily));
        when(familyMemberRepository.findByIdAndFamilyId(100L, 10L)).thenReturn(Optional.of(mockFamilyMember));
        when(familyMemberRepository.save(any())).thenReturn(mockFamilyMember);

        familyService.updateMemberRole(10L, 100L, 1L, request);

        assertEquals(FamilyMember.MemberRole.MANAGER, mockFamilyMember.getRole());
        verify(familyMemberRepository, times(1)).save(mockFamilyMember);
    }

    @Test
    void regenerateInviteCode_IsOwner_Success() {
        when(familyRepository.findById(10L)).thenReturn(Optional.of(mockFamily));
        when(familyRepository.existsByInviteCode(anyString())).thenReturn(false);
        when(familyRepository.save(any(Family.class))).thenReturn(mockFamily);

        String newCode = familyService.regenerateInviteCode(10L, 1L);

        assertNotNull(newCode);
        verify(familyRepository, times(1)).save(mockFamily);
    }
}