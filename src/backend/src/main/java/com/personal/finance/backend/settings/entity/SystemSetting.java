package com.personal.finance.backend.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_setting")
public class SystemSetting {
    @Id
    @Column(name = "setting_key", length = 50)
    private String key;

    @Column(name = "setting_value", nullable = false)
    private String value;

    private String description;
}