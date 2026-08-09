package com.personal.finance.backend.wallets.repository.impl;

import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.mapper.WalletMapper;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import com.personal.finance.backend.wallets.service.WalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletMapper walletMapper;

    private Wallet getWalletEntity(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví!"));
    }

    private void requireOwner(Wallet wallet, Long requesterId) {
        if (!wallet.getOwner().getId().equals(requesterId)) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên ví này!");
        }
    }
    
    private void requireAccess(Wallet wallet, Long requesterId) {
        if (!walletRepository.existsAccessibleByUser(wallet.getId(), requesterId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập ví này!");
        }
    }

    @Override
    @Transactional
    public WalletDTO createWallet(Long ownerId, CreateWalletRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Wallet wallet = new Wallet();
        wallet.setName(request.getName());
        wallet.setBalance(request.getBalance() == null ? 0.0 : request.getBalance());
        wallet.setIcon(request.getIcon());
        wallet.setColor(request.getColor());
        wallet.setOwner(owner);

        return walletMapper.toDTO(walletRepository.save(wallet));
    }

    @Override
    public List<WalletDTO> getWalletsForUser(Long userId) {
        return walletRepository.findAllWalletAccessByUser(userId)
                .stream()
                .map(walletMapper::toDTO)
                .toList();
    }

    @Override
    public WalletDTO getWalletById(Long walletId, Long requesterId) {
        Wallet wallet = getWalletEntity(walletId);
        requireAccess(wallet, requesterId);
        return walletMapper.toDTO(wallet);
    }

    @Override
    @Transactional
    public WalletDTO updateWallet(Long walletId, Long requesterId, UpdateWalletRequest request) {
        Wallet wallet = getWalletEntity(walletId);
        requireOwner(wallet, requesterId);

        wallet.setName(request.getName());
        wallet.setIcon(request.getIcon());
        wallet.setColor(request.getColor());
        return walletMapper.toDTO(walletRepository.save(wallet));
    }

    @Override
    @Transactional
    public void deleteWallet(Long walletId, Long requesterId) {
        Wallet wallet = getWalletEntity(walletId);
        requireOwner(wallet, requesterId);
        walletRepository.delete(wallet);
    }
}