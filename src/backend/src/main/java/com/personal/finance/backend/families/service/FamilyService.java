package com.personal.finance.backend.families.service;

import com.personal.finance.backend.families.dto.request.CreateFamilyRequest;
import com.personal.finance.backend.families.dto.request.JoinFamilyRequest;
import com.personal.finance.backend.families.dto.request.UpdateMemberRoleRequest;
import com.personal.finance.backend.families.dto.response.FamilyDTO;
import com.personal.finance.backend.families.dto.response.FamilyMemberDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FamilyService {

    FamilyDTO createFamily(Long userId, CreateFamilyRequest request);

    FamilyDTO getMyFamily(Long userId);

    FamilyDTO joinFamily(Long userId, JoinFamilyRequest request);

    void leaveFamily(Long userId);

    Page<FamilyMemberDTO> getMembers(Long familyId, Long requesterId, Pageable pageable);

    FamilyMemberDTO updateMemberRole(Long familyId, Long memberId, Long requesterId, UpdateMemberRoleRequest request);

    void removeMember(Long familyId, Long memberId, Long requesterId);

    String regenerateInviteCode(Long familyId, Long requesterId);

    void deleteFamily(Long familyId, Long requesterId);
}