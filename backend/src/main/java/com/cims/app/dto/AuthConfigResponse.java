package com.cims.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for authentication configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthConfigResponse {
    private boolean twoFactorEnabled;
    private boolean passkeyEnabled;
    private boolean captchaEnabled;
    private String captchaSiteKey;
    private String captchaProvider;
    private boolean userHas2FA;
    private boolean userHasPasskey;
    private int remainingBackupCodes;
    private int passkeyCount;
}

// Made with Bob