package com.personal.finance.backend.families.service.impl;

import com.personal.finance.backend.families.dto.request.CreateFamilyRequest;
import com.personal.finance.backend.families.dto.request.JoinFamilyRequest;
import com.personal.finance.backend.families.dto.request.UpdateMemberRoleRequest;
import com.personal.finance.backend.families.dto.response.FamilyDTO;
import com.personal.finance.backend.families.dto.response.FamilyMemberDTO;
import com.personal.finance.backend.families.entity.Family;
import com.personal.finance.backend.families.entity.FamilyMember;
import com.personal.finance.backend.families.mapper.FamilyMapper;
import com.personal.finance.backend.families.repository.FamilyMemberRepository;
import com.personal.finance.backend.families.repository.FamilyRepository;
import com.personal.finance.backend.families.service.FamilyService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyServiceImpl implements FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final FamilyMapper familyMapper;

    private void requireNoExistingFamily(Long userId) {
        if (familyRepository.findByOwnerId(userId).isPresent()
                || familyMemberRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Bạn đã thuộc một gia đình khác, không thể tạo/tham gia gia đình mới!");
        }
    }

    private Family getFamilyEntity(Long familyId) {
        return familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gia đình!"));
    }

    private void requireOwner(Family family, Long requesterId) {
        if (!family.getOwner().getId().equals(requesterId)) {
            throw new AccessDeniedException("Chỉ chủ gia đình mới có quyền thực hiện thao tác này!");
        }
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (familyRepository.existsByInviteCode(code));
        return code;
    }

    @Override
    @Transactional
    public FamilyDTO createFamily(Long userId, CreateFamilyRequest request) {
        requireNoExistingFamily(userId);

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Family family = new Family();
        family.setName(request.getName());
        family.setInviteCode(generateUniqueInviteCode());
        family.setOwner(owner);
        family = familyRepository.save(family);

        FamilyMember ownerMember = new FamilyMember();
        ownerMember.setFamily(family);
        ownerMember.setUser(owner);
        ownerMember.setRole(FamilyMember.MemberRole.MANAGER);
        familyMemberRepository.save(ownerMember);

        return familyMapper.toDTO(family);
    }

    @Override
    public FamilyDTO getMyFamily(Long userId) {
        return familyRepository.findByOwnerId(userId)
                .or(() -> familyMemberRepository.findByUserId(userId).map(FamilyMember::getFamily))
                .map(familyMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Bạn chưa thuộc gia đình nào!"));
    }

    @Override
    @Transactional
    public FamilyDTO joinFamily(Long userId, JoinFamilyRequest request) {
        requireNoExistingFamily(userId);

        Family family = familyRepository.findByInviteCode(request.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Mã mời không hợp lệ!"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        FamilyMember member = new FamilyMember();
        member.setFamily(family);
        member.setUser(user);
        member.setRole(FamilyMember.MemberRole.MEMBER);
        familyMemberRepository.save(member);

        return familyMapper.toDTO(family);
    }

    @Override
    @Transactional
    public void leaveFamily(Long userId) {
        FamilyMember member = familyMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa thuộc gia đình nào!"));

        // BR: owner khong duoc roi truc tiep, tranh de lai family khong co chu
        if (member.getFamily().getOwner().getId().equals(userId)) {
            throw new RuntimeException("Chủ gia đình không thể tự rời đi. Hãy xoá gia đình nếu muốn dừng sử dụng!");
        }

        familyMemberRepository.delete(member);
    }

    @Override
    public Page<FamilyMemberDTO> getMembers(Long familyId, Long requesterId, Pageable pageable) {
        Family family = getFamilyEntity(familyId);
        // SE-06: chi owner hoac member trong chinh family do moi duoc xem danh sach
        boolean isOwner = family.getOwner().getId().equals(requesterId);
        boolean isMember = familyMemberRepository.findByUserId(requesterId)
                .map(m -> m.getFamily().getId().equals(familyId))
                .orElse(false);
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("Bạn không thuộc gia đình này!");
        }

        return familyMemberRepository.findAllByFamilyId(familyId, pageable)
                .map(familyMapper::toDTO);
    }

    @Override
    @Transactional
    public FamilyMemberDTO updateMemberRole(Long familyId, Long memberId, Long requesterId, UpdateMemberRoleRequest request) {
        Family family = getFamilyEntity(familyId);
        requireOwner(family, requesterId);

        FamilyMember member = familyMemberRepository.findByIdAndFamilyId(memberId, familyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên!"));

        if (member.getUser().getId().equals(requesterId)) {
            throw new RuntimeException("Không thể tự đổi vai trò của chính chủ gia đình!");
        }

        member.setRole(request.getRole());
        return familyMapper.toDTO(familyMemberRepository.save(member));
    }

    @Override
    @Transactional
    public void removeMember(Long familyId, Long memberId, Long requesterId) {
        Family family = getFamilyEntity(familyId);
        requireOwner(family, requesterId);

        FamilyMember member = familyMemberRepository.findByIdAndFamilyId(memberId, familyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên!"));

        if (member.getUser().getId().equals(requesterId)) {
            throw new RuntimeException("Không thể tự xoá chính chủ gia đình. Hãy xoá gia đình nếu muốn dừng sử dụng!");
        }

        familyMemberRepository.delete(member);
    }

    @Override
    @Transactional
    public String regenerateInviteCode(Long familyId, Long requesterId) {
        Family family = getFamilyEntity(familyId);
        requireOwner(family, requesterId);

        family.setInviteCode(generateUniqueInviteCode());
        return familyRepository.save(family).getInviteCode();
    }

    @Override
    @Transactional
    public void deleteFamily(Long familyId, Long requesterId) {
        Family family = getFamilyEntity(familyId);
        requireOwner(family, requesterId);
        familyRepository.delete(family); // cascade xoa het FamilyMember (orphanRemoval = true tren Family.members)
    }
}