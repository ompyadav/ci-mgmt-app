# Advanced Authentication Guide

## Overview

This guide covers the implementation of advanced authentication features in the CI Management System:
- **Two-Factor Authentication (2FA)** using TOTP (Time-based One-Time Password)
- **Passkey Authentication** using WebAuthn/FIDO2
- **Captcha Verification** using Google reCAPTCHA

All features can be **enabled or disabled** globally through configuration, giving you full control over security requirements.

---

## Table of Contents

1. [Configuration](#configuration)
2. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
3. [Passkey Authentication](#passkey-authentication)
4. [Captcha Verification](#captcha-verification)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Database Schema](#database-schema)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Configuration

### Application Properties

Configure authentication features in `application.properties`:

```properties
# Two-Factor Authentication (2FA) Configuration
auth.2fa.enabled=false                    # Enable/disable 2FA globally
auth.2fa.issuer=CIMS                      # Issuer name for authenticator apps
auth.2fa.code-validity-seconds=30         # TOTP code validity window
auth.2fa.backup-codes-count=10            # Number of backup codes to generate

# Passkey (WebAuthn) Configuration
auth.passkey.enabled=false                # Enable/disable Passkey globally
auth.passkey.rp-name=CIMS                 # Relying Party name
auth.passkey.rp-id=localhost              # Relying Party ID (domain)
auth.passkey.origin=http://localhost:5174 # Frontend origin URL
auth.passkey.timeout=60000                # Authentication timeout (ms)
auth.passkey.attestation=none             # Attestation preference

# Captcha Configuration
auth.captcha.enabled=false                # Enable/disable Captcha globally
auth.captcha.provider=recaptcha           # Captcha provider (recaptcha)
auth.captcha.site-key=                    # Google reCAPTCHA site key
auth.captcha.secret-key=                  # Google reCAPTCHA secret key
auth.captcha.verify-url=https://www.google.com/recaptcha/api/siteverify
auth.captcha.threshold=0.5                # Minimum score for reCAPTCHA v3
```

### Environment Variables

For production, use environment variables:

```bash
# 2FA
export AUTH_2FA_ENABLED=true
export AUTH_2FA_ISSUER=YourCompany

# Passkey
export AUTH_PASSKEY_ENABLED=true
export AUTH_PASSKEY_RP_ID=yourdomain.com
export AUTH_PASSKEY_ORIGIN=https://yourdomain.com

# Captcha
export AUTH_CAPTCHA_ENABLED=true
export CAPTCHA_SITE_KEY=your_site_key
export CAPTCHA_SECRET_KEY=your_secret_key
```

---

## Two-Factor Authentication (2FA)

### Features

- **TOTP-based** authentication (compatible with Google Authenticator, Authy, etc.)
- **Backup codes** for account recovery
- **QR code generation** for easy setup
- **Time-based codes** with 30-second validity window
- **Clock skew tolerance** (±1 time window)

### User Flow

#### 1. Enable 2FA

**Endpoint:** `POST /api/auth/2fa/setup`

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/CIMS:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CIMS",
  "backupCodes": [
    "123456",
    "789012",
    "345678",
    ...
  ],
  "issuer": "CIMS",
  "enabled": false
}
```

#### 2. Verify and Activate

**Endpoint:** `POST /api/auth/2fa/verify`

**Request:**
```json
{
  "code": "123456",
  "isBackupCode": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA activated successfully"
}
```

#### 3. Login with 2FA

When 2FA is enabled, users must provide:
1. Email and password
2. TOTP code from authenticator app OR backup code

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "totpCode": "123456"
}
```

#### 4. Disable 2FA

**Endpoint:** `POST /api/auth/2fa/disable`

**Request:**
```json
{
  "code": "123456"
}
```

#### 5. Regenerate Backup Codes

**Endpoint:** `POST /api/auth/2fa/backup-codes/regenerate`

**Request:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "backupCodes": [
    "111111",
    "222222",
    ...
  ]
}
```

### Implementation Details

- **Algorithm:** HMAC-SHA1
- **Digits:** 6
- **Period:** 30 seconds
- **Secret:** Base32-encoded random bytes
- **Backup Codes:** 6-digit random numbers

---

## Passkey Authentication

### Features

- **Passwordless authentication** using WebAuthn/FIDO2
- **Platform authenticators** (fingerprint, face recognition)
- **Security keys** (YubiKey, etc.)
- **Multiple passkeys** per user
- **Phishing-resistant** authentication

### User Flow

#### 1. Register Passkey

**Step 1:** Get registration options

**Endpoint:** `POST /api/auth/passkey/register/options`

**Response:**
```json
{
  "challenge": "base64_encoded_challenge",
  "rp": {
    "name": "CIMS",
    "id": "localhost"
  },
  "user": {
    "id": "base64_user_id",
    "name": "user@example.com",
    "displayName": "John Doe"
  },
  "pubKeyCredParams": [
    {"type": "public-key", "alg": -7},
    {"type": "public-key", "alg": -257}
  ],
  "timeout": 60000,
  "attestation": "none",
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "requireResidentKey": false,
    "userVerification": "preferred"
  }
}
```

**Step 2:** Create credential using WebAuthn API (frontend)

```javascript
const credential = await navigator.credentials.create({
  publicKey: options
});
```

**Step 3:** Verify and register

**Endpoint:** `POST /api/auth/passkey/register/verify`

**Request:**
```json
{
  "id": "credential_id",
  "publicKey": "base64_public_key",
  "response": {
    "clientDataJSON": "...",
    "attestationObject": "..."
  }
}
```

#### 2. Authenticate with Passkey

**Step 1:** Get authentication options

**Endpoint:** `POST /api/auth/passkey/authenticate/options`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Step 2:** Get assertion using WebAuthn API (frontend)

```javascript
const assertion = await navigator.credentials.get({
  publicKey: options
});
```

**Step 3:** Verify assertion

**Endpoint:** `POST /api/auth/passkey/authenticate/verify`

#### 3. Manage Passkeys

**List Passkeys:**
```
GET /api/auth/passkey/list
```

**Remove Passkey:**
```
DELETE /api/auth/passkey/{credentialId}
```

**Disable All Passkeys:**
```
POST /api/auth/passkey/disable
```

### Browser Support

- Chrome/Edge 67+
- Firefox 60+
- Safari 13+
- Opera 54+

---

## Captcha Verification

### Features

- **Google reCAPTCHA v2** (checkbox)
- **Google reCAPTCHA v3** (score-based)
- **Configurable threshold** for v3
- **IP-based verification**

### Setup

#### 1. Get reCAPTCHA Keys

1. Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register your site
3. Get Site Key and Secret Key

#### 2. Configure

```properties
auth.captcha.enabled=true
auth.captcha.site-key=your_site_key_here
auth.captcha.secret-key=your_secret_key_here
auth.captcha.threshold=0.5  # For v3 only
```

#### 3. Frontend Integration

**reCAPTCHA v2:**
```html
<div class="g-recaptcha" data-sitekey="your_site_key"></div>
<script src="https://www.google.com/recaptcha/api.js"></script>
```

**reCAPTCHA v3:**
```javascript
grecaptcha.ready(function() {
  grecaptcha.execute('your_site_key', {action: 'login'})
    .then(function(token) {
      // Send token with login request
    });
});
```

#### 4. Verify on Backend

Captcha is automatically verified during login when enabled.

**Manual Verification:**

**Endpoint:** `POST /api/auth/captcha/verify`

**Request:**
```json
{
  "token": "captcha_response_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Captcha verification successful",
  "score": 0.9
}
```

---

## API Endpoints

### Authentication Configuration

```
GET /api/auth/config
```

Returns current authentication configuration:
```json
{
  "twoFactorEnabled": true,
  "passkeyEnabled": true,
  "captchaEnabled": true,
  "captchaSiteKey": "your_site_key",
  "captchaProvider": "recaptcha",
  "userHas2FA": false,
  "userHasPasskey": false,
  "remainingBackupCodes": 0,
  "passkeyCount": 0
}
```

### 2FA Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/2fa/config` | Get 2FA configuration |
| POST | `/api/auth/2fa/setup` | Initialize 2FA setup |
| POST | `/api/auth/2fa/verify` | Verify and activate 2FA |
| POST | `/api/auth/2fa/disable` | Disable 2FA |
| POST | `/api/auth/2fa/backup-codes/regenerate` | Regenerate backup codes |

### Passkey Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/passkey/config` | Get Passkey configuration |
| POST | `/api/auth/passkey/register/options` | Get registration options |
| POST | `/api/auth/passkey/register/verify` | Verify and register passkey |
| GET | `/api/auth/passkey/list` | List user's passkeys |
| DELETE | `/api/auth/passkey/{id}` | Remove specific passkey |
| POST | `/api/auth/passkey/disable` | Disable all passkeys |

### Captcha Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/captcha/config` | Get Captcha configuration |
| POST | `/api/auth/captcha/verify` | Verify captcha token |

---

## Frontend Integration

### React Example - 2FA Setup

```typescript
import { useState } from 'react';
import QRCode from 'qrcode.react';

function TwoFactorSetup() {
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');

  const setup2FA = async () => {
    const response = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setQrData(data);
  };

  const verify2FA = async () => {
    const response = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    const result = await response.json();
    if (result.success) {
      alert('2FA activated!');
    }
  };

  return (
    <div>
      <button onClick={setup2FA}>Setup 2FA</button>
      {qrData && (
        <>
          <QRCode value={qrData.qrCodeUrl} />
          <input 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
          />
          <button onClick={verify2FA}>Verify</button>
          <div>
            <h3>Backup Codes:</h3>
            {qrData.backupCodes.map(code => (
              <div key={code}>{code}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

### React Example - Passkey Registration

```typescript
async function registerPasskey() {
  // Get registration options
  const optionsResponse = await fetch('/api/auth/passkey/register/options', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const options = await optionsResponse.json();

  // Create credential
  const credential = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: base64ToArrayBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64ToArrayBuffer(options.user.id)
      }
    }
  });

  // Verify and register
  const verifyResponse = await fetch('/api/auth/passkey/register/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: credential.id,
      publicKey: arrayBufferToBase64(credential.response.getPublicKey()),
      response: {
        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
      }
    })
  });
}
```

---

## Database Schema

### User Table Updates

```sql
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN backup_codes TEXT;
ALTER TABLE users ADD COLUMN passkey_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN passkey_credentials TEXT;
ALTER TABLE users ADD COLUMN captcha_required BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_2fa_setup TIMESTAMP;
ALTER TABLE users ADD COLUMN last_passkey_setup TIMESTAMP;
```

### System Settings Table

```sql
CREATE TABLE system_settings (
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
```

---

## Security Considerations

### 2FA Security

1. **Secret Storage:** TOTP secrets are encrypted in the database
2. **Backup Codes:** One-time use, removed after consumption
3. **Clock Skew:** ±1 time window tolerance (90 seconds total)
4. **Rate Limiting:** Implement rate limiting on verification endpoints

### Passkey Security

1. **Challenge Uniqueness:** Each challenge is unique and time-limited
2. **Origin Validation:** Credentials are bound to specific origins
3. **User Verification:** Requires biometric or PIN
4. **Phishing Resistant:** Cannot be used on fake sites

### Captcha Security

1. **Score Threshold:** Adjust based on your security needs
2. **IP Tracking:** Monitor for suspicious patterns
3. **Token Expiry:** Tokens are single-use
4. **Fallback:** Have alternative verification for accessibility

### General Best Practices

1. **HTTPS Only:** All authentication must use HTTPS in production
2. **Session Management:** Implement proper session timeout
3. **Audit Logging:** Log all authentication attempts
4. **Account Lockout:** Implement after failed attempts
5. **Password Policy:** Enforce strong passwords
6. **Regular Updates:** Keep dependencies updated

---

## Troubleshooting

### 2FA Issues

**Problem:** QR code not scanning
- **Solution:** Ensure the secret is properly base32-encoded
- **Solution:** Check issuer name doesn't contain special characters

**Problem:** Codes not working
- **Solution:** Verify server time is synchronized (NTP)
- **Solution:** Check time zone configuration

**Problem:** Backup codes not working
- **Solution:** Ensure codes haven't been used already
- **Solution:** Check database storage format

### Passkey Issues

**Problem:** Registration fails
- **Solution:** Verify HTTPS is enabled (required for WebAuthn)
- **Solution:** Check browser compatibility
- **Solution:** Ensure RP ID matches domain

**Problem:** Authentication fails
- **Solution:** Verify origin matches configuration
- **Solution:** Check credential hasn't been removed
- **Solution:** Try different authenticator

### Captcha Issues

**Problem:** Verification always fails
- **Solution:** Verify secret key is correct
- **Solution:** Check network connectivity to Google
- **Solution:** Ensure site key matches domain

**Problem:** Low scores in v3
- **Solution:** Adjust threshold in configuration
- **Solution:** Check for bot-like behavior patterns
- **Solution:** Consider switching to v2

---

## Enable/Disable Features

### Via Application Properties

Edit `application.properties`:
```properties
auth.2fa.enabled=true
auth.passkey.enabled=true
auth.captcha.enabled=true
```

Restart the application.

### Via Environment Variables

```bash
export AUTH_2FA_ENABLED=true
export AUTH_PASSKEY_ENABLED=true
export AUTH_CAPTCHA_ENABLED=true
```

### Via Database (Runtime)

```sql
UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'auth.2fa.enabled';

UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'auth.passkey.enabled';

UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'auth.captcha.enabled';
```

### Via Admin API (Future Enhancement)

Create an admin endpoint to toggle features:

```typescript
POST /api/admin/settings/authentication
{
  "2fa_enabled": true,
  "passkey_enabled": true,
  "captcha_enabled": true
}
```

---

## Testing

### Test 2FA

```bash
# Setup 2FA
curl -X POST http://localhost:8080/api/auth/2fa/setup \
  -H "Authorization: Bearer $TOKEN"

# Verify with code from authenticator app
curl -X POST http://localhost:8080/api/auth/2fa/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

### Test Captcha

```bash
# Get config
curl http://localhost:8080/api/auth/captcha/config

# Verify token
curl -X POST http://localhost:8080/api/auth/captcha/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "captcha_response_token"}'
```

---

## Support

For issues or questions:
- Check logs: `logs/application.log`
- Review configuration: `application.properties`
- Verify database: Check `users` and `system_settings` tables
- Test endpoints: Use Swagger UI at `/swagger-ui.html`

---

**Made with Bob** 🤖