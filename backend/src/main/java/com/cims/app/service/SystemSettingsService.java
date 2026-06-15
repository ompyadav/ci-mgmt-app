package com.cims.app.service;

import com.cims.app.entity.SystemSettings;
import com.cims.app.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for managing system settings
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsService {

    private final SystemSettingsRepository systemSettingsRepository;

    /**
     * Get setting value by key
     */
    public String getSetting(String key) {
        return systemSettingsRepository.findBySettingKey(key)
                .map(SystemSettings::getSettingValue)
                .orElse(null);
    }

    /**
     * Get setting value with default
     */
    public String getSetting(String key, String defaultValue) {
        String value = getSetting(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get boolean setting
     */
    public boolean getBooleanSetting(String key, boolean defaultValue) {
        String value = getSetting(key);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }

    /**
     * Update or create setting
     */
    @Transactional
    public void updateSetting(String key, String value, String updatedBy) {
        SystemSettings setting = systemSettingsRepository.findBySettingKey(key)
                .orElse(SystemSettings.builder()
                        .settingKey(key)
                        .settingType("STRING")
                        .isPublic(false)
                        .createdBy(updatedBy)
                        .build());

        setting.setSettingValue(value);
        setting.setUpdatedBy(updatedBy);
        systemSettingsRepository.save(setting);

        log.info("Setting updated: {} = {} by {}", key, value, updatedBy);
    }

    /**
     * Get all authentication settings
     */
    public Map<String, Object> getAuthenticationSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("2fa_enabled", getBooleanSetting("auth.2fa.enabled", false));
        settings.put("2fa_mandatory", getBooleanSetting("auth.2fa.mandatory", false));
        settings.put("passkey_enabled", getBooleanSetting("auth.passkey.enabled", false));
        settings.put("passkey_mandatory", getBooleanSetting("auth.passkey.mandatory", false));
        settings.put("captcha_enabled", getBooleanSetting("auth.captcha.enabled", false));
        return settings;
    }

    /**
     * Update authentication settings
     */
    @Transactional
    public void updateAuthenticationSettings(Map<String, Boolean> settings, String updatedBy) {
        settings.forEach((key, value) -> {
            String settingKey = "auth." + key.replace("_", ".");
            updateSetting(settingKey, value.toString(), updatedBy);
        });
        log.info("Authentication settings updated by {}", updatedBy);
    }

    /**
     * Get all settings
     */
    public List<SystemSettings> getAllSettings() {
        return systemSettingsRepository.findAll();
    }

    /**
     * Get public settings (for frontend)
     */
    public Map<String, String> getPublicSettings() {
        List<SystemSettings> publicSettings = systemSettingsRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsPublic()))
                .toList();

        Map<String, String> settings = new HashMap<>();
        publicSettings.forEach(s -> settings.put(s.getSettingKey(), s.getSettingValue()));
        return settings;
    }

    /**
     * Delete setting
     */
    @Transactional
    public void deleteSetting(String key) {
        systemSettingsRepository.findBySettingKey(key)
                .ifPresent(setting -> {
                    systemSettingsRepository.delete(setting);
                    log.info("Setting deleted: {}", key);
                });
    }
}

// Made with Bob