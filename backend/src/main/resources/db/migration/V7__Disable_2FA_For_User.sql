-- Disable 2FA for specific user
-- Version: 7.0
-- Description: Disable two-factor authentication for ompyadav@gmail.com

UPDATE users 
SET totp_enabled = false,
    totp_secret = null,
    mfa_enabled = false,
    backup_codes = null,
    last_2fa_setup = null
WHERE email = 'ompyadav@gmail.com';

-- Made with Bob