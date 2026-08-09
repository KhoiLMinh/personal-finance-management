package com.personal.finance.backend.wallets.repository;

import com.personal.finance.backend.wallets.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    @Query("""
        SELECT DISTINCT w FROM Wallet w LEFT JOIN WalletMember wm ON wm.wallet = w
            WHERE w.owner.id = :userId OR wm.user.id = :userId
                ORDER BY w.createAt DESC
        """)
    List<Wallet> findAllWalletAccessByUser(@Param("userId") Long userId);

    @Query("""
        SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END
        FROM Wallet w LEFT JOIN WalletMember wm ON wm.wallet = w
            WHERE w.id = :walletId AND (w.owner.id = :userId OR wm.user.id = :userId)
        """)
    boolean existsAccessibleByUser(@Param("walletId") Long walletId, @Param("userId") Long userId);
}