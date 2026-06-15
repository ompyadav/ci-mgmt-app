package com.cims.app.repository;

import com.cims.app.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SystemSettings entity
 */
@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    
    Optional<SystemSettings> findBySettingKey(String settingKey);
    
    boolean existsBySettingKey(String settingKey);
}

// Made with Bob