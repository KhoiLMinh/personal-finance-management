package com.personal.finance.backend.families.dto.response;

import com.personal.finance.backend.families.entity.FamilyMember;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FamilyMemberDTO {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private FamilyMember.MemberRole role;
}