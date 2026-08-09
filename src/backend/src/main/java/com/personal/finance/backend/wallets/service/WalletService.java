package com.personal.finance.backend.services;

import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;

import java.util.List;

public interface WalletService {
    WalletDTO createWallet(Long ownerId, CreateWalletRequest request);
    List<WalletDTO> getWalletsForUser(Long userId);
    WalletDTO getWalletById(Long walletId, Long requesterId);
    WalletDTO updateWallet(Long walletId, Long requesterId, UpdateWalletRequest request);
    void deleteWallet(Long walletId, Long requesterId);
}