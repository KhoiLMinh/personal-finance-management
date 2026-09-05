package com.personal.finance.backend.wallets.service.impl;

import com.personal.finance.backend.common.service.EmailService;
import com.personal.finance.backend.families.entity.Family;
import com.personal.finance.backend.families.entity.FamilyMember;
import com.personal.finance.backend.families.repository.FamilyMemberRepository;
import com.personal.finance.backend.families.repository.FamilyRepository;
import com.personal.finance.backend.notifications.service.NotificationService;
import com.personal.finance.backend.wallets.dto.request.AddWalletMemberRequest;
import com.personal.finance.backend.wallets.dto.request.CreateWalletRequest;
import com.personal.finance.backend.users.dto.request.UpdateWalletRequest;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.wallets.dto.response.WalletMemberDTO;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.entity.WalletMember;
import com.personal.finance.backend.wallets.mapper.WalletMapper;
import com.personal.finance.backend.users.repository.UserRepository;
import com.personal.finance.backend.wallets.repository.WalletMemberRepository;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import com.personal.finance.backend.wallets.service.WalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletMapper walletMapper;
    private final WalletMemberRepository walletMemberRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;

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
        wallet.setBalance(request.getBalance() == null ? BigDecimal.ZERO : request.getBalance());
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

    @Override
    public List<WalletMemberDTO> getWalletMembers(Long walletId, Long requesterId) {
        Wallet wallet = getWalletEntity(walletId);
        requireAccess(wallet, requesterId);
        return walletMemberRepository.findAllByWalletId(walletId)
                .stream()
                .map(walletMapper::toMemberDTO)
                .toList();
    }

    // FR-13
    @Override
    @Transactional
    public WalletMemberDTO shareWallet(Long walletId, Long requesterId, AddWalletMemberRequest request) {
        Wallet wallet = getWalletEntity(walletId);
        requireOwner(wallet, requesterId);

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này trong hệ thống!"));

        if (wallet.getOwner().getId().equals(targetUser.getId())) {
            throw new RuntimeException("Không thể mời chính chủ sở hữu vào ví!");
        }

        Family ownerFamily = familyRepository.findByOwnerId(requesterId)
                .orElseGet(() -> familyMemberRepository.findByUserId(requesterId)
                        .map(com.personal.finance.backend.families.entity.FamilyMember::getFamily)
                        .orElse(null));

        Family targetFamily = familyRepository.findByOwnerId(targetUser.getId())
                .orElseGet(() -> familyMemberRepository.findByUserId(targetUser.getId())
                        .map(com.personal.finance.backend.families.entity.FamilyMember::getFamily)
                        .orElse(null));

        if (ownerFamily == null || targetFamily == null || !ownerFamily.getId().equals(targetFamily.getId())) {
            throw new RuntimeException("Chỉ có thể chia sẻ ví cho các thành viên trong cùng một Gia đình!");
        }

        com.personal.finance.backend.wallets.entity.WalletMember member = walletMemberRepository.findByWalletIdAndUserId(walletId, targetUser.getId())
                .orElse(new com.personal.finance.backend.wallets.entity.WalletMember());

        member.setWallet(wallet);
        member.setUser(targetUser);
        member.setPermissions(request.getPermission());

        com.personal.finance.backend.wallets.entity.WalletMember savedMember = walletMemberRepository.save(member);

        String roleName = request.getPermission() == com.personal.finance.backend.wallets.entity.WalletMember.Permission.EDIT ? "CHỈNH SỬA" : "CHỈ XEM";
        String emailBody = String.format(
                "Xin chào %s,\n\n" +
                        "Bạn vừa được chia sẻ quyền truy cập vào ví: '%s' từ thành viên trong gia đình.\n" +
                        "Vai trò của bạn: %s.\n\n" +
                        "Hãy đăng nhập vào hệ thống Personal Finance ngay để xem chi tiết và cùng quản lý chi tiêu nhé!\n\n" +
                        "Trân trọng,\nĐội ngũ Hỗ trợ.",
                targetUser.getFullName(), wallet.getName(), roleName
        );

        emailService.sendEmail(targetUser.getEmail(), "Bạn được mời tham gia quản lý ví!", emailBody);

        String notifContent = String.format("Bạn vừa được %s mời tham gia quản lý ví '%s' với quyền %s.",
                wallet.getOwner().getFullName(), wallet.getName(), roleName);
        notificationService.createSystemNotification(targetUser.getId(), "Lời mời tham gia ví", notifContent, 2);

        return walletMapper.toMemberDTO(savedMember);
    }
}