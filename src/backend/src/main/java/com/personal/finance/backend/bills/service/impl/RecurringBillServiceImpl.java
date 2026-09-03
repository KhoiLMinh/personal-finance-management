package com.personal.finance.backend.bills.service.impl;

import com.personal.finance.backend.bills.dto.request.CreateRecurringBillRequest;
import com.personal.finance.backend.bills.dto.request.UpdateRecurringBillRequest;
import com.personal.finance.backend.bills.dto.response.RecurringBillDTO;
import com.personal.finance.backend.bills.entity.RecurringBill;
import com.personal.finance.backend.bills.mapper.RecurringBillMapper;
import com.personal.finance.backend.bills.repository.RecurringBillRepository;
import com.personal.finance.backend.bills.service.RecurringBillService;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecurringBillServiceImpl implements RecurringBillService {

    private final RecurringBillRepository recurringBillRepository;
    private final UserRepository userRepository;
    private final RecurringBillMapper recurringBillMapper;

    @Override
    @Transactional
    public RecurringBillDTO createBill(Long userId, CreateRecurringBillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        RecurringBill bill = new RecurringBill();
        bill.setTitle(request.getTitle());
        bill.setAmount(request.getAmount());
        bill.setFrequency(request.getFrequency());
        bill.setExecutionDay(request.getExecutionDay());
        bill.setNotificationTime(request.getNotificationTime());
        bill.setUser(user);

        return recurringBillMapper.toDTO(recurringBillRepository.save(bill));
    }

    @Override
    public Page<RecurringBillDTO> getMyBills(Long userId, Pageable pageable) {
        return recurringBillRepository.findAllByUserId(userId, pageable)
                .map(recurringBillMapper::toDTO);
    }

    // THÊM TRIỂN KHAI LOGIC CẬP NHẬT Ở ĐÂY
    @Override
    @Transactional
    public RecurringBillDTO updateBill(Long id, Long userId, UpdateRecurringBillRequest request) {
        RecurringBill bill = recurringBillRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn định kỳ hoặc bạn không có quyền truy cập!"));

        bill.setTitle(request.getTitle());
        bill.setAmount(request.getAmount());
        bill.setFrequency(request.getFrequency());
        bill.setExecutionDay(request.getExecutionDay());
        bill.setNotificationTime(request.getNotificationTime());

        return recurringBillMapper.toDTO(recurringBillRepository.save(bill));
    }

    @Override
    @Transactional
    public void deleteBill(Long id, Long userId) {
        RecurringBill bill = recurringBillRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn định kỳ!"));
        recurringBillRepository.delete(bill);
    }
}