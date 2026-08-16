package com.personal.finance.backend.wallets.repository;
import com.personal.finance.backend.wallets.entity.WalletMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WalletMemberRepository extends JpaRepository<WalletMember, Long> {
    Optional<WalletMember> findByWalletIdAndUserId(Long walletId, Long userId);
    List<WalletMember> findAllByWalletId(Long walletId);
}
