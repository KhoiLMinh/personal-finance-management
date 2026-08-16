package com.personal.finance.backend.families.controller;

import com.personal.finance.backend.families.dto.request.CreateFamilyRequest;
import com.personal.finance.backend.families.dto.request.JoinFamilyRequest;
import com.personal.finance.backend.families.dto.request.UpdateMemberRoleRequest;
import com.personal.finance.backend.families.dto.response.FamilyDTO;
import com.personal.finance.backend.families.dto.response.FamilyMemberDTO;
import com.personal.finance.backend.families.service.FamilyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/families")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @PostMapping
    public ResponseEntity<FamilyDTO> createFamily(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateFamilyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(familyService.createFamily(userId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<FamilyDTO> getMyFamily(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(familyService.getMyFamily(userId));
    }

    @PostMapping("/join")
    public ResponseEntity<FamilyDTO> joinFamily(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody JoinFamilyRequest request) {
        return ResponseEntity.ok(familyService.joinFamily(userId, request));
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveFamily(@RequestAttribute("userId") Long userId) {
        familyService.leaveFamily(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<Page<FamilyMemberDTO>> getMembers(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            Pageable pageable) {
        return ResponseEntity.ok(familyService.getMembers(id, userId, pageable));
    }

    @PatchMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<FamilyMemberDTO> updateMemberRole(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        return ResponseEntity.ok(familyService.updateMemberRole(id, memberId, userId, request));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @PathVariable Long memberId) {
        familyService.removeMember(id, memberId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/invite-code/regenerate")
    public ResponseEntity<Map<String, String>> regenerateInviteCode(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        String newCode = familyService.regenerateInviteCode(id, userId);
        return ResponseEntity.ok(Map.of("inviteCode", newCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamily(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        familyService.deleteFamily(id, userId);
        return ResponseEntity.noContent().build();
    }
}