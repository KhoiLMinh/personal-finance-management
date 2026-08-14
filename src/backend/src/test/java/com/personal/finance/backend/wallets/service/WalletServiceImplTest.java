package com.personal.finance.backend.wallets.service;

import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.mapper.WalletMapper;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import com.personal.finance.backend.wallets.repository.impl.WalletServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// TE-13: Dùng Mockito để cô lập Service, không dùng database thật
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
        mockWallet.setBalance(500000.0);
        mockWallet.setOwner(owner);

        mockWalletDTO = new WalletDTO();
        mockWalletDTO.setId(10L);
        mockWalletDTO.setName("Ví Tiền Mặt");
        mockWalletDTO.setBalance(500000.0);
    }

    @Test
    void createWallet_ValidRequest_Success() {

        CreateWalletRequest request = new CreateWalletRequest();
        request.setName("Ví Tiết Kiệm");
        request.setBalance(100000.0);

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
    void getWalletById_HasAccess_ReturnsWalletDTO() {

        Long requesterId = 1L;
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(walletRepository.existsAccessibleByUser(10L, requesterId)).thenReturn(true);
        when(walletMapper.toDTO(mockWallet)).thenReturn(mockWalletDTO);


        WalletDTO result = walletService.getWalletById(10L, requesterId);


        assertNotNull(result);
        assertEquals(10L, result.getId());
    }

    // TC-12 & SE-06: Test Case bảo mật IDOR (Chặn xem ví người khác)
    @Test
    void getWalletById_NoAccess_ThrowsAccessDeniedException() {

        Long hackerId = 99L;
        when(walletRepository.findById(10L)).thenReturn(Optional.of(mockWallet));
        when(walletRepository.existsAccessibleByUser(10L, hackerId)).thenReturn(false);


        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            walletService.getWalletById(10L, hackerId);
        });

        assertEquals("Bạn không có quyền truy cập ví này!", exception.getMessage());
        verify(walletMapper, never()).toDTO(any());
    }



    @Test
    void updateWallet_IsOwner_Success() {

        Long requesterId = 1L; // Đúng chủ sở hữu
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
        assertEquals("Ví Mới", mockWallet.getName()); // Kiểm tra entity đã đổi tên
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
        verify(walletRepository, never()).save(any()); // Đảm bảo giao dịch không được lưu
    }
}