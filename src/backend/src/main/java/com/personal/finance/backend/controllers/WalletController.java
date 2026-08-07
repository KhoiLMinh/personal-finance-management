package com.personal.finance.backend.controllers;

import com.personal.finance.backend.dtos.request.CreateWalletRequest;
import com.personal.finance.backend.dtos.request.UpdateWalletRequest;
import com.personal.finance.backend.dtos.response.WalletDTO;
import com.personal.finance.backend.services.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
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
}