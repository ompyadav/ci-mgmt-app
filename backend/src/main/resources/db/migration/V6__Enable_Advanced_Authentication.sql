-- Enable Advanced Authentication Features in System Settings
-- This migration enables 2FA and Passkey authentication at the system level

-- Insert or update 2FA enabled setting
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, created_by, updated_by, created_at, updated_at)
VALUES ('auth.2fa.enabled', 'true', 'BOOLEAN', 'Enable Two-Factor Authentication system-wide', true, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = 'true',
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP;

-- Insert or update Passkey enabled setting
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, created_by, updated_by, created_at, updated_at)
VALUES ('auth.passkey.enabled', 'true', 'BOOLEAN', 'Enable Passkey Authentication system-wide', true, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = 'true',
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP;

-- Insert or update CAPTCHA enabled setting (optional, set to false by default)
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, created_by, updated_by, created_at, updated_at)
VALUES ('auth.captcha.enabled', 'false', 'BOOLEAN', 'Enable CAPTCHA for login', true, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = 'false',
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP;

-- Made with Bob
