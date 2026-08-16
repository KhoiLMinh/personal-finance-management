package com.personal.finance.backend.families.repository;

import com.personal.finance.backend.families.entity.FamilyMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    Optional<FamilyMember> findByUserId(Long userId);
    Optional<FamilyMember> findByIdAndFamilyId(Long id, Long familyId);
    Page<FamilyMember> findAllByFamilyId(Long familyId, Pageable pageable);
}