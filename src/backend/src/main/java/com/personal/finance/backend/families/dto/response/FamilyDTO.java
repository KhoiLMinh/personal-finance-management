package com.personal.finance.backend.families.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FamilyDTO {
    private Long id;
    private String name;
    private String inviteCode;
    private Long ownerId;
    private String ownerUsername;
}