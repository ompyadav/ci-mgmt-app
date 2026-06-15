package com.cims.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Enhanced authentication request with support for 2FA, Passkey, and Captcha
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String password;
    
    // 2FA fields
    private String totpCode;
    private String backupCode;
    
    // Passkey fields
    private String passkeyAssertion;
    
    // Captcha field
    private String captchaToken;
    
    // Authentication method
    private AuthMethod authMethod;
    
    public enum AuthMethod {
        PASSWORD,
        PASSKEY,
        PASSWORD_WITH_2FA
    }
}

// Made with Bob