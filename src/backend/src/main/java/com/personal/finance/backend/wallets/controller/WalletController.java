package com.personal.finance.backend.wallets.controller;

import com.personal.finance.backend.wallets.dto.request.AddWalletMemberRequest;
import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.wallets.dto.response.WalletMemberDTO;
import com.personal.finance.backend.wallets.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping
    public ResponseEntity<WalletDTO> createWallet(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateWalletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(walletService.createWallet(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<WalletDTO>> getMyWallets(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(walletService.getWalletsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalletDTO> getWalletById(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(walletService.getWalletById(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WalletDTO> updateWallet(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWalletRequest request) {
        return ResponseEntity.ok(walletService.updateWallet(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWallet(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        walletService.deleteWallet(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<WalletMemberDTO>> getWalletMembers(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(walletService.getWalletMembers(id, userId));
    }

    @PostMapping("/{id}/members/share")
    public ResponseEntity<WalletMemberDTO> shareWallet(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody AddWalletMemberRequest request) {
        return ResponseEntity.ok(walletService.shareWallet(id, userId, request));
    }
}