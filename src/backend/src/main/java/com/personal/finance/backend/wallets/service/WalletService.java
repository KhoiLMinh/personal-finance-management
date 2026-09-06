package com.personal.finance.backend.wallets.service;

import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.dto.response.WalletMemberDTO;

import java.util.List;

public interface WalletService {
    WalletDTO createWallet(Long ownerId, CreateWalletRequest request);
    List<WalletDTO> getWalletsForUser(Long userId);
    WalletDTO updateWallet(Long walletId, Long requesterId, UpdateWalletRequest request);
    void deleteWallet(Long walletId, Long requesterId);
    WalletMemberDTO shareWallet(Long walletId, Long requesterId, com.personal.finance.backend.wallets.dto.request.AddWalletMemberRequest request);
    List<WalletMemberDTO> getWalletMembers(Long walletId, Long requesterId);
}