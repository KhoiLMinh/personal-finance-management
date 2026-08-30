package com.personal.finance.backend.wallets.repository;

import com.personal.finance.backend.wallets.entity.WalletMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WalletMemberRepository extends JpaRepository<WalletMember, Long> {
    Optional<WalletMember> findByWalletIdAndUserId(Long walletId, Long userId);
    List<WalletMember> findAllByWalletId(Long walletId);

    @Modifying
    @Query("DELETE FROM WalletMember wm WHERE wm.user.id = :userId OR wm.wallet.owner.id = :userId")
    void revokeAllSharingForUser(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM WalletMember wm WHERE wm.user.id = :ownerId OR wm.wallet.owner.id = :ownerId " +
            "OR wm.user.id IN (SELECT fm.user.id FROM FamilyMember fm WHERE fm.family.id = :familyId) " +
            "OR wm.wallet.owner.id IN (SELECT fm.user.id FROM FamilyMember fm WHERE fm.family.id = :familyId)")
    void revokeAllSharingForFamily(@Param("familyId") Long familyId, @Param("ownerId") Long ownerId);
}