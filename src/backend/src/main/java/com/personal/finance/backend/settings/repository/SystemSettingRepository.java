package com.personal.finance.backend.settings.repository;

import com.personal.finance.backend.settings.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}