package com.cims.app.service;

import com.cims.app.entity.User;
import com.cims.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Two-Factor Authentication (TOTP - Time-based One-Time Password)
 * Implements RFC 6238 TOTP algorithm
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorAuthService {

    private final UserRepository userRepository;

    @Value("${auth.2fa.enabled:false}")
    private boolean twoFactorEnabled;

    @Value("${auth.2fa.issuer:CIMS}")
    private String issuer;

    @Value("${auth.2fa.code-validity-seconds:30}")
    private int codeValiditySeconds;

    @Value("${auth.2fa.backup-codes-count:10}")
    private int backupCodesCount;

    private static final String TOTP_ALGORITHM = "HmacSHA1";
    private static final int TOTP_DIGITS = 6;
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    /**
     * Check if 2FA is globally enabled
     */
    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    /**
     * Generate a secret key for TOTP
     */
    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20]; // 160 bits
        random.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /**
     * Generate QR code URL for authenticator apps
     */
    public String generateQRCodeUrl(String email, String secret) {
        String encodedEmail = email.replace(" ", "%20");
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
            issuer, encodedEmail, secret, issuer, TOTP_DIGITS, codeValiditySeconds
        );
    }

    /**
     * Verify TOTP code
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != TOTP_DIGITS) {
            return false;
        }

        try {
            long currentTime = Instant.now().getEpochSecond() / codeValiditySeconds;
            
            // Check current time window and adjacent windows (to account for clock skew)
            for (int i = -1; i <= 1; i++) {
                String generatedCode = generateTOTP(secret, currentTime + i);
                if (code.equals(generatedCode)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error verifying TOTP code", e);
            return false;
        }
    }

    /**
     * Generate TOTP code for a given time counter
     */
    private String generateTOTP(String secret, long timeCounter) throws NoSuchAlgorithmException, InvalidKeyException {
        byte[] key = base32Decode(secret);
        byte[] data = ByteBuffer.allocate(8).putLong(timeCounter).array();

        Mac mac = Mac.getInstance(TOTP_ALGORITHM);
        mac.init(new SecretKeySpec(key, TOTP_ALGORITHM));
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xf;
        int binary = ((hash[offset] & 0x7f) << 24) |
                     ((hash[offset + 1] & 0xff) << 16) |
                     ((hash[offset + 2] & 0xff) << 8) |
                     (hash[offset + 3] & 0xff);

        int otp = binary % (int) Math.pow(10, TOTP_DIGITS);
        return String.format("%0" + TOTP_DIGITS + "d", otp);
    }

    /**
     * Enable 2FA for a user
     */
    @Transactional
    public Map<String, Object> enableTwoFactor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!twoFactorEnabled) {
            throw new RuntimeException("Two-factor authentication is not enabled globally");
        }

        String secret = generateSecret();
        String qrCodeUrl = generateQRCodeUrl(user.getEmail(), secret);
        List<String> backupCodes = generateBackupCodes();

        user.setTotpSecret(secret);
        user.setBackupCodes(String.join(",", backupCodes));
        user.setTotpEnabled(false); // Will be enabled after verification
        user.setLast2faSetup(LocalDateTime.now());
        userRepository.save(user);

        log.info("2FA setup initiated for user: {}", user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("secret", secret);
        response.put("qrCodeUrl", qrCodeUrl);
        response.put("backupCodes", backupCodes);
        response.put("issuer", issuer);
        return response;
    }

    /**
     * Verify and activate 2FA for a user
     */
    @Transactional
    public boolean verifyAndActivateTwoFactor(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTotpSecret() == null) {
            throw new RuntimeException("2FA not set up for this user");
        }

        if (verifyCode(user.getTotpSecret(), code)) {
            user.setTotpEnabled(true);
            user.setMfaEnabled(true);
            userRepository.save(user);
            log.info("2FA activated for user: {}", user.getEmail());
            return true;
        }

        return false;
    }

    /**
     * Disable 2FA for a user
     */
    @Transactional
    public void disableTwoFactor(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getTotpEnabled()) {
            throw new RuntimeException("2FA is not enabled for this user");
        }

        // Verify code or backup code before disabling
        if (!verifyCode(user.getTotpSecret(), code) && !verifyBackupCode(user, code)) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        user.setBackupCodes(null);
        
        // Disable MFA if no other methods are enabled
        if (!user.getPasskeyEnabled()) {
            user.setMfaEnabled(false);
        }
        
        userRepository.save(user);
        log.info("2FA disabled for user: {}", user.getEmail());
    }

    /**
     * Verify backup code
     */
    public boolean verifyBackupCode(User user, String code) {
        if (user.getBackupCodes() == null || code == null) {
            return false;
        }

        List<String> backupCodes = new ArrayList<>(Arrays.asList(user.getBackupCodes().split(",")));
        if (backupCodes.contains(code)) {
            // Remove used backup code
            backupCodes.remove(code);
            user.setBackupCodes(String.join(",", backupCodes));
            userRepository.save(user);
            log.info("Backup code used for user: {}", user.getEmail());
            return true;
        }

        return false;
    }

    /**
     * Generate backup codes
     */
    private List<String> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        return random.ints(backupCodesCount, 100000, 999999)
                .mapToObj(String::valueOf)
                .collect(Collectors.toList());
    }

    /**
     * Regenerate backup codes
     */
    @Transactional
    public List<String> regenerateBackupCodes(Long userId, String verificationCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getTotpEnabled()) {
            throw new RuntimeException("2FA is not enabled for this user");
        }

        if (!verifyCode(user.getTotpSecret(), verificationCode)) {
            throw new RuntimeException("Invalid verification code");
        }

        List<String> newBackupCodes = generateBackupCodes();
        user.setBackupCodes(String.join(",", newBackupCodes));
        userRepository.save(user);

        log.info("Backup codes regenerated for user: {}", user.getEmail());
        return newBackupCodes;
    }

    /**
     * Base32 encode
     */
    private String base32Encode(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : bytes) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                result.append(BASE32_CHARS.charAt((buffer >> (bitsLeft - 5)) & 0x1F));
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0) {
            result.append(BASE32_CHARS.charAt((buffer << (5 - bitsLeft)) & 0x1F));
        }

        return result.toString();
    }

    /**
     * Base32 decode
     */
    private byte[] base32Decode(String encoded) {
        encoded = encoded.toUpperCase().replaceAll("[^A-Z2-7]", "");
        byte[] result = new byte[encoded.length() * 5 / 8];
        int buffer = 0;
        int bitsLeft = 0;
        int index = 0;

        for (char c : encoded.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;

            buffer = (buffer << 5) | val;
            bitsLeft += 5;

            if (bitsLeft >= 8) {
                result[index++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }

        return result;
    }

    /**
     * Get remaining backup codes count
     */
    public int getRemainingBackupCodesCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBackupCodes() == null) {
            return 0;
        }

        return user.getBackupCodes().split(",").length;
    }
}

// Made with Bob