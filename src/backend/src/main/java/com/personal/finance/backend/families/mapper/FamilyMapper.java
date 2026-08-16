package com.personal.finance.backend.families.mapper;

import com.personal.finance.backend.families.dto.response.FamilyDTO;
import com.personal.finance.backend.families.dto.response.FamilyMemberDTO;
import com.personal.finance.backend.families.entity.Family;
import com.personal.finance.backend.families.entity.FamilyMember;
import org.springframework.stereotype.Component;

@Component
public class FamilyMapper {

    public FamilyDTO toDTO(Family family) {
        if (family == null) return null;
        FamilyDTO dto = new FamilyDTO();
        dto.setId(family.getId());
        dto.setName(family.getName());
        dto.setInviteCode(family.getInviteCode());
        dto.setOwnerId(family.getOwner().getId());
        dto.setOwnerUsername(family.getOwner().getUsername());
        return dto;
    }

    public FamilyMemberDTO toDTO(FamilyMember member) {
        if (member == null) return null;
        FamilyMemberDTO dto = new FamilyMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setFullName(member.getUser().getFullName());
        dto.setRole(member.getRole());
        return dto;
    }
}