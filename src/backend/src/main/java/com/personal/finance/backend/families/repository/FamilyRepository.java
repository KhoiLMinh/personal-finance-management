package com.personal.finance.backend.families.repository;

import com.personal.finance.backend.families.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    Optional<Family> findByOwnerId(Long ownerId);
    Optional<Family> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}