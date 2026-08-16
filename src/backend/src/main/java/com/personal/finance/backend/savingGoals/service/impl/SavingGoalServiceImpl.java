package com.personal.finance.backend.savingGoals.service.impl;

import com.personal.finance.backend.savingGoals.dto.request.AddFundRequest;
import com.personal.finance.backend.savingGoals.dto.request.CreateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.request.UpdateSavingGoalRequest;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.savingGoals.entity.SavingGoal;
import com.personal.finance.backend.savingGoals.mapper.SavingGoalMapper;
import com.personal.finance.backend.savingGoals.repository.SavingGoalRepository;
import com.personal.finance.backend.savingGoals.service.SavingGoalService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final UserRepository userRepository;
    private final SavingGoalMapper savingGoalMapper;

    private SavingGoal getOwnedSavingGoal(Long id, Long userId) {
        return savingGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    log.warn("Truy cập trái phép hoặc không tìm thấy mục tiêu. UserId: {}, GoalId: {}", userId, id);
                    return new RuntimeException("Không tìm thấy mục tiêu tiết kiệm hoặc bạn không có quyền truy cập!");
                });
    }

    @Override
    @Transactional
    public SavingGoalDTO createSavingGoal(Long userId, CreateSavingGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        SavingGoal goal = new SavingGoal();
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(0.0); // Mặc định khi tạo mới là 0
        goal.setDeadline(request.getDeadline());
        goal.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        goal.setUser(user);

        SavingGoal savedGoal = savingGoalRepository.save(goal);
        log.info("Tạo thành công mục tiêu tiết kiệm ID: {} cho UserId: {}", savedGoal.getId(), userId);
        return savingGoalMapper.toDTO(savedGoal);
    }

    @Override
    public Page<SavingGoalDTO> getSavingGoals(Long userId, Pageable pageable) {
        return savingGoalRepository.findAllByUserId(userId, pageable)
                .map(savingGoalMapper::toDTO);
    }

    @Override
    public SavingGoalDTO getSavingGoalById(Long id, Long userId) {
        return savingGoalMapper.toDTO(getOwnedSavingGoal(id, userId));
    }

    @Override
    @Transactional
    public SavingGoalDTO updateSavingGoal(Long id, Long userId, UpdateSavingGoalRequest request) {
        SavingGoal goal = getOwnedSavingGoal(id, userId);

        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());

        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            goal.setStatus(SavingGoal.GoalStatus.COMPLETE);
        } else {
            goal.setStatus(SavingGoal.GoalStatus.IN_PROGRESS);
        }

        SavingGoal updatedGoal = savingGoalRepository.save(goal);
        log.info("Cập nhật thành công mục tiêu tiết kiệm ID: {} bởi UserId: {}", id, userId);
        return savingGoalMapper.toDTO(updatedGoal);
    }


    @Override
    @Transactional
    public SavingGoalDTO addFunds(Long id, Long userId, AddFundRequest request) {
        int updatedRows = savingGoalRepository.addFundsToGoal(id, userId, request.getAmount());

        if (updatedRows == 0) {
            throw new RuntimeException("Không tìm thấy mục tiêu hoặc cập nhật thất bại!");
        }

        SavingGoal goal = getOwnedSavingGoal(id, userId);

        if (goal.getStatus() != SavingGoal.GoalStatus.COMPLETE &&
                goal.getCurrentAmount() >= goal.getTargetAmount()) {
            goal.setStatus(SavingGoal.GoalStatus.COMPLETE);
            savingGoalRepository.save(goal);
            log.info("Mục tiêu tiết kiệm ID: {} đã hoàn thành!", id);
        }

        log.info("Đã thêm {} vào mục tiêu ID: {} bởi UserId: {}", request.getAmount(), id, userId);
        return savingGoalMapper.toDTO(goal);
    }

    @Override
    @Transactional
    public void deleteSavingGoal(Long id, Long userId) {
        SavingGoal goal = getOwnedSavingGoal(id, userId);
        savingGoalRepository.delete(goal);
        log.info("Xóa thành công mục tiêu tiết kiệm ID: {} bởi UserId: {}", id, userId);
    }
}