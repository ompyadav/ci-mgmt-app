package com.cims.app.controller;

import com.cims.app.dto.*;
import com.cims.app.service.*;
import com.cims.app.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for authentication endpoints with 2FA, Passkey, and Captcha support
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication management APIs with advanced security features")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final TwoFactorAuthService twoFactorAuthService;
    private final PasskeyService passkeyService;
    private final CaptchaService captchaService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for user: {}", loginRequest.getEmail());
        JwtAuthenticationResponse response = authenticationService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/2fa")
    @Operation(summary = "Login with 2FA", description = "Complete login with two-factor authentication code")
    public ResponseEntity<JwtAuthenticationResponse> loginWith2FA(@Valid @RequestBody Map<String, String> request) {
        log.info("2FA login request received for user: {}", request.get("email"));
        
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(request.get("email"));
        loginRequest.setPassword(request.get("password"));
        
        String totpCode = request.get("code");
        String captchaToken = request.get("captchaToken");
        
        JwtAuthenticationResponse response = authenticationService.login(loginRequest, totpCode, captchaToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    public ResponseEntity<JwtAuthenticationResponse> refreshToken(@RequestParam String refreshToken) {
        log.info("Token refresh request received");
        JwtAuthenticationResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and clear security context")
    public ResponseEntity<String> logout() {
        log.info("Logout request received");
        authenticationService.logout();
        return ResponseEntity.ok("Logged out successfully");
    }

    // ==================== 2FA Endpoints ====================
    
    @GetMapping("/2fa/config")
    @Operation(summary = "Get 2FA configuration", description = "Get current 2FA settings")
    public ResponseEntity<Map<String, Object>> get2FAConfig(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("2FA config request for user: {}", userPrincipal.getId());
        Map<String, Object> config = Map.of(
            "enabled", twoFactorAuthService.isTwoFactorEnabled(),
            "userEnabled", userPrincipal.getUser().getTotpEnabled() != null && userPrincipal.getUser().getTotpEnabled(),
            "remainingBackupCodes", twoFactorAuthService.getRemainingBackupCodesCount(userPrincipal.getId())
        );
        return ResponseEntity.ok(config);
    }

    @PostMapping("/2fa/setup")
    @Operation(summary = "Setup 2FA", description = "Initialize 2FA setup and get QR code")
    public ResponseEntity<TwoFactorSetupResponse> setup2FA(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("2FA setup request for user: {}", userPrincipal.getId());
        Map<String, Object> setup = twoFactorAuthService.enableTwoFactor(userPrincipal.getId());
        
        TwoFactorSetupResponse response = TwoFactorSetupResponse.builder()
                .secret((String) setup.get("secret"))
                .qrCodeUrl((String) setup.get("qrCodeUrl"))
                .backupCodes((List<String>) setup.get("backupCodes"))
                .issuer((String) setup.get("issuer"))
                .enabled(false)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Verify and activate 2FA", description = "Verify TOTP code and activate 2FA")
    public ResponseEntity<Map<String, Object>> verify2FA(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        log.info("2FA verification request for user: {}", userPrincipal.getId());
        
        boolean verified = twoFactorAuthService.verifyAndActivateTwoFactor(
                userPrincipal.getId(),
                request.getCode()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", verified,
            "message", verified ? "2FA activated successfully" : "Invalid verification code"
        ));
    }

    @PostMapping("/2fa/disable")
    @Operation(summary = "Disable 2FA", description = "Disable two-factor authentication")
    public ResponseEntity<Map<String, String>> disable2FA(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        log.info("2FA disable request for user: {}", userPrincipal.getId());
        twoFactorAuthService.disableTwoFactor(userPrincipal.getId(), request.getCode());
        return ResponseEntity.ok(Map.of("message", "2FA disabled successfully"));
    }

    @PostMapping("/2fa/backup-codes/regenerate")
    @Operation(summary = "Regenerate backup codes", description = "Generate new backup codes")
    public ResponseEntity<Map<String, Object>> regenerateBackupCodes(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        log.info("Backup codes regeneration request for user: {}", userPrincipal.getId());
        List<String> codes = twoFactorAuthService.regenerateBackupCodes(
                userPrincipal.getId(),
                request.getCode()
        );
        return ResponseEntity.ok(Map.of("backupCodes", codes));
    }

    // ==================== Passkey Endpoints ====================
    
    @GetMapping("/passkey/config")
    @Operation(summary = "Get Passkey configuration", description = "Get current Passkey settings")
    public ResponseEntity<Map<String, Object>> getPasskeyConfig(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Passkey config request for user: {}", userPrincipal.getId());
        Map<String, Object> config = Map.of(
            "enabled", passkeyService.isPasskeyEnabled(),
            "userEnabled", userPrincipal.getUser().getPasskeyEnabled() != null && userPrincipal.getUser().getPasskeyEnabled(),
            "passkeyCount", passkeyService.getPasskeyCount(userPrincipal.getId())
        );
        return ResponseEntity.ok(config);
    }

    @PostMapping("/passkey/register/options")
    @Operation(summary = "Get passkey registration options", description = "Get WebAuthn registration options")
    public ResponseEntity<Map<String, Object>> getPasskeyRegistrationOptions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Passkey registration options request for user: {}", userPrincipal.getId());
        Map<String, Object> options = passkeyService.generateRegistrationOptions(userPrincipal.getId());
        return ResponseEntity.ok(options);
    }

    @PostMapping("/passkey/register/verify")
    @Operation(summary = "Verify and register passkey", description = "Verify and store passkey credential")
    public ResponseEntity<Map<String, Object>> verifyPasskeyRegistration(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> credential) {
        log.info("Passkey registration verification for user: {}", userPrincipal.getId());
        boolean success = passkeyService.verifyAndRegisterPasskey(userPrincipal.getId(), credential);
        return ResponseEntity.ok(Map.of(
            "success", success,
            "message", success ? "Passkey registered successfully" : "Failed to register passkey"
        ));
    }

    @GetMapping("/passkey/list")
    @Operation(summary = "List passkeys", description = "Get list of registered passkeys")
    public ResponseEntity<List<Map<String, Object>>> listPasskeys(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("List passkeys request for user: {}", userPrincipal.getId());
        List<Map<String, Object>> passkeys = passkeyService.listPasskeys(userPrincipal.getId());
        return ResponseEntity.ok(passkeys);
    }

    @DeleteMapping("/passkey/{credentialId}")
    @Operation(summary = "Remove passkey", description = "Remove a specific passkey")
    public ResponseEntity<Map<String, String>> removePasskey(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String credentialId) {
        log.info("Remove passkey request for user: {}", userPrincipal.getId());
        passkeyService.removePasskey(userPrincipal.getId(), credentialId);
        return ResponseEntity.ok(Map.of("message", "Passkey removed successfully"));
    }

    @PostMapping("/passkey/disable")
    @Operation(summary = "Disable passkey", description = "Disable all passkeys")
    public ResponseEntity<Map<String, String>> disablePasskey(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Disable passkey request for user: {}", userPrincipal.getId());
        passkeyService.disablePasskey(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Passkey disabled successfully"));
    }

    @PostMapping("/passkey/authenticate/options")
    @Operation(summary = "Get passkey authentication options", description = "Get WebAuthn authentication options for login")
    public ResponseEntity<Map<String, Object>> getPasskeyAuthenticationOptions(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("Passkey authentication options request for email: {}", email);
        Map<String, Object> options = passkeyService.generateAuthenticationOptions(email);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/passkey/authenticate/verify")
    @Operation(summary = "Verify passkey authentication", description = "Verify passkey and complete login")
    public ResponseEntity<JwtAuthenticationResponse> verifyPasskeyAuthentication(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        @SuppressWarnings("unchecked")
        Map<String, Object> assertion = (Map<String, Object>) request.get("assertion");
        
        log.info("Passkey authentication verification request received");
        log.info("Email: {}", email);
        log.info("Assertion keys: {}", assertion != null ? assertion.keySet() : "null");
        log.debug("Full assertion: {}", assertion);
        
        boolean verified = passkeyService.verifyPasskeyAuthentication(email, assertion);
        
        if (verified) {
            log.info("Passkey verification successful, generating tokens");
            JwtAuthenticationResponse response = authenticationService.authenticateWithPasskey(email);
            return ResponseEntity.ok(response);
        } else {
            log.warn("Passkey verification failed for email: {}", email);
            throw new RuntimeException("Passkey authentication failed");
        }
    }

    // ==================== Captcha Endpoints ====================
    
    @GetMapping("/captcha/config")
    @Operation(summary = "Get Captcha configuration", description = "Get Captcha settings for frontend")
    public ResponseEntity<Map<String, Object>> getCaptchaConfig() {
        log.info("Captcha config request");
        Map<String, Object> config = captchaService.getCaptchaConfig();
        return ResponseEntity.ok(config);
    }

    @PostMapping("/captcha/verify")
    @Operation(summary = "Verify Captcha", description = "Verify captcha token")
    public ResponseEntity<Map<String, Object>> verifyCaptcha(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String token = request.get("token");
        String remoteIp = httpRequest.getRemoteAddr();
        
        log.info("Captcha verification request from IP: {}", remoteIp);
        CaptchaService.CaptchaVerificationResult result =
            captchaService.verifyCaptchaDetailed(token, remoteIp);
        
        return ResponseEntity.ok(Map.of(
            "success", result.isSuccess(),
            "message", result.getMessage(),
            "score", result.getScore() != null ? result.getScore() : 0.0
        ));
    }

    // ==================== General Endpoints ====================
    
    @GetMapping("/config")
    @Operation(summary = "Get authentication configuration", description = "Get all authentication settings")
    public ResponseEntity<AuthConfigResponse> getAuthConfig(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Auth config request for user: {}", userPrincipal != null ? userPrincipal.getId() : "anonymous");
        
        AuthConfigResponse.AuthConfigResponseBuilder builder = AuthConfigResponse.builder()
                .twoFactorEnabled(twoFactorAuthService.isTwoFactorEnabled())
                .passkeyEnabled(passkeyService.isPasskeyEnabled())
                .captchaEnabled(captchaService.isCaptchaEnabled())
                .captchaSiteKey(captchaService.getSiteKey())
                .captchaProvider("recaptcha");
        
        if (userPrincipal != null) {
            builder.userHas2FA(userPrincipal.getUser().getTotpEnabled() != null && userPrincipal.getUser().getTotpEnabled())
                   .userHasPasskey(userPrincipal.getUser().getPasskeyEnabled() != null && userPrincipal.getUser().getPasskeyEnabled())
                   .remainingBackupCodes(twoFactorAuthService.getRemainingBackupCodesCount(userPrincipal.getId()))
                   .passkeyCount(passkeyService.getPasskeyCount(userPrincipal.getId()));
        }
        
        return ResponseEntity.ok(builder.build());
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if authentication service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is running");
    }
}

// Made with Bob
