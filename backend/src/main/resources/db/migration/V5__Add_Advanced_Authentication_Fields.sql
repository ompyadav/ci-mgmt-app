-- Add advanced authentication fields to users table
-- Two-Factor Authentication (TOTP)
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT;

-- Passkey (WebAuthn) Support
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_credentials TEXT;

-- Captcha Configuration
ALTER TABLE users ADD COLUMN IF NOT EXISTS captcha_required BOOLEAN DEFAULT FALSE;

-- Tracking fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_2fa_setup TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_passkey_setup TIMESTAMP;

-- Create system settings table for global authentication configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Insert default authentication settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES 
    ('auth.2fa.enabled', 'false', 'BOOLEAN', 'Enable/Disable Two-Factor Authentication globally', false),
    ('auth.passkey.enabled', 'false', 'BOOLEAN', 'Enable/Disable Passkey authentication globally', false),
    ('auth.captcha.enabled', 'false', 'BOOLEAN', 'Enable/Disable Captcha verification globally', false),
    ('auth.2fa.mandatory', 'false', 'BOOLEAN', 'Make 2FA mandatory for all users', false),
    ('auth.passkey.mandatory', 'false', 'BOOLEAN', 'Make Passkey mandatory for all users', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX IF NOT EXISTS idx_users_passkey_enabled ON users(passkey_enabled);

-- Made with Bob