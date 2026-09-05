package com.personal.finance.backend.wallets.service;

import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.families.entity.Family;
import com.personal.finance.backend.families.repository.FamilyMemberRepository;
import com.personal.finance.backend.families.repository.FamilyRepository;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.dto.request.AddWalletMemberRequest;
import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.mapper.WalletMapper;
import com.personal.finance.backend.wallets.repository.WalletMemberRepository;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import com.personal.finance.backend.wallets.service.impl.WalletServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletMapper walletMapper;

    @InjectMocks
    private WalletServiceImpl walletService;

    @Mock
    private WalletMemberRepository walletMemberRepository;
    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private FamilyRepository familyRepository;
    @Mock
    private FamilyMemberRepository familyMemberRepository;

    private User owner;
    private Wallet mockWallet;
    private WalletDTO mockWalletDTO;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setUsername("owner_user");

        mockWallet = new Wallet();
        mockWallet.setId(10L);
        mockWallet.setName("Ví Tiền Mặt");
        mockWallet.setBalance(BigDecimal.valueOf(500000.0));
        mockWallet.setOwner(owner);

        mockWalletDTO = new WalletDTO();
        mockWalletDTO.setId(10L);
        mockWalletDTO.setName("Ví Tiền Mặt");
        mockWalletDTO.setBalance(BigDecimal.valueOf(500000.0));
    }

    @Test
    void createWallet_ValidRequest_Success() {
        CreateWalletRequest request = new CreateWalletRequest();
        request.setName("Ví Tiết Kiệm");
        request.setBalance(BigDecimal.valueOf(100000.0));

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(walletRepository.save(any(Wallet.class))).thenReturn(mockWallet);
        when(walletMapper.toDTO(any(Wallet.class))).thenReturn(mockWalletDTO);

        WalletDTO result = walletService.createWallet(1L, request);

        assertNotNull(result);
        assertEquals("Ví Tiền Mặt", result.getName());
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    void createWallet_UserNotFound_ThrowsException() {
        CreateWalletRequest request = new CreateWalletRequest();
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            walletService.createWallet(99L, request);
        });

        assertEquals("Không tìm thấy người dùng!", exception.getMessage());
        verify(walletRepository, never()).save(any());
    }

    @Test
    void updateWallet_IsOwner_Success() {
        Long requesterId = 1L;
        UpdateWalletRequest request = new UpdateWalletRequest();
        request.setName("Ví Mới");

        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(walletRepository.save(any(Wallet.class))).thenReturn(mockWallet);

        WalletDTO updatedDTO = new WalletDTO();
        updatedDTO.setName("Ví Mới");
        when(walletMapper.toDTO(any(Wallet.class))).thenReturn(updatedDTO);

        WalletDTO result = walletService.updateWallet(10L, requesterId, request);

        assertNotNull(result);
        assertEquals("Ví Mới", result.getName());
        assertEquals("Ví Mới", mockWallet.getName());
        verify(walletRepository, times(1)).save(mockWallet);
    }

    @Test
    void updateWallet_NotOwner_ThrowsAccessDeniedException() {
        Long notOwnerId = 2L;
        UpdateWalletRequest request = new UpdateWalletRequest();

        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            walletService.updateWallet(10L, notOwnerId, request);
        });

        assertEquals("Bạn không có quyền thao tác trên ví này!", exception.getMessage());
        verify(walletRepository, never()).save(any());
    }

    @Test
    void deleteWallet_IsOwner_Success() {
        Long requesterId = 1L;
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));

        walletService.deleteWallet(10L, requesterId);

        verify(walletRepository, times(1)).delete(mockWallet);
    }

    @Test
    void shareWallet_ValidRequest_SameFamily_SuccessAndSendsEmail() {
        Long requesterId = 1L;
        AddWalletMemberRequest request = new AddWalletMemberRequest();
        request.setEmail("friend@example.com");
        request.setPermission(com.personal.finance.backend.wallets.entity.WalletMember.Permission.VIEW);

        User targetUser = new User();
        targetUser.setId(2L);
        targetUser.setEmail("friend@example.com");
        targetUser.setFullName("Bạn Thân");

        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(userRepository.findByEmail("friend@example.com")).thenReturn(Optional.of(targetUser));

        Family mockFamily = new Family();
        mockFamily.setId(5L);
        when(familyRepository.findByOwnerId(1L)).thenReturn(Optional.of(mockFamily));
        when(familyRepository.findByOwnerId(2L)).thenReturn(Optional.of(mockFamily));

        when(walletMemberRepository.findByWalletIdAndUserId(10L, 2L)).thenReturn(Optional.empty());

        com.personal.finance.backend.wallets.entity.WalletMember savedMember = new com.personal.finance.backend.wallets.entity.WalletMember();
        when(walletMemberRepository.save(any())).thenReturn(savedMember);

        walletService.shareWallet(10L, requesterId, request);

        verify(walletMemberRepository, times(1)).save(any());
        verify(emailService, times(1)).sendEmail(eq("friend@example.com"), anyString(), anyString());
    }

    @Test
    void shareWallet_InviteSelf_ThrowsException() {
        Long requesterId = 1L;
        AddWalletMemberRequest request = new AddWalletMemberRequest();
        request.setEmail("owner_user@example.com");

        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(userRepository.findByEmail("owner_user@example.com")).thenReturn(Optional.of(owner));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            walletService.shareWallet(10L, requesterId, request);
        });

        assertEquals("Không thể mời chính chủ sở hữu vào ví!", exception.getMessage());
        verify(walletMemberRepository, never()).save(any());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void shareWallet_NotSameFamily_ThrowsException() {
        Long requesterId = 1L;
        AddWalletMemberRequest request = new AddWalletMemberRequest();
        request.setEmail("stranger@example.com");
        request.setPermission(com.personal.finance.backend.wallets.entity.WalletMember.Permission.VIEW);

        User targetUser = new User();
        targetUser.setId(2L);
        targetUser.setEmail("stranger@example.com");

        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(targetUser));

        Family ownerFamily = new Family(); ownerFamily.setId(5L);
        Family targetFamily = new Family(); targetFamily.setId(9L);

        when(familyRepository.findByOwnerId(1L)).thenReturn(Optional.of(ownerFamily));
        when(familyRepository.findByOwnerId(2L)).thenReturn(Optional.of(targetFamily));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            walletService.shareWallet(10L, requesterId, request);
        });

        assertEquals("Chỉ có thể chia sẻ ví cho các thành viên trong cùng một Gia đình!", exception.getMessage());
        verify(walletMemberRepository, never()).save(any());
    }
}