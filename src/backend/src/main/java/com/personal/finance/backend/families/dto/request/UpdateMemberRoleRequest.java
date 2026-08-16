package com.personal.finance.backend.families.dto.request;

import com.personal.finance.backend.families.entity.FamilyMember;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMemberRoleRequest {
    @NotNull
    private FamilyMember.MemberRole role;
}