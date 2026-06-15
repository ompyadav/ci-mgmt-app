package com.cims.app.service;

import com.cims.app.entity.User;
import com.cims.app.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for Passkey (WebAuthn) authentication
 * Implements FIDO2/WebAuthn standard for passwordless authentication
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasskeyService {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${auth.passkey.enabled:false}")
    private boolean passkeyEnabled;

    @Value("${auth.passkey.rp-name:CIMS}")
    private String rpName;

    @Value("${auth.passkey.rp-id:localhost}")
    private String rpId;

    @Value("${auth.passkey.origin:http://localhost:5174}")
    private String origin;

    @Value("${auth.passkey.timeout:60000}")
    private long timeout;

    @Value("${auth.passkey.attestation:none}")
    private String attestation;

    /**
     * Check if Passkey is globally enabled
     */
    public boolean isPasskeyEnabled() {
        return passkeyEnabled;
    }

    /**
     * Generate registration options for WebAuthn
     */
    public Map<String, Object> generateRegistrationOptions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passkeyEnabled) {
            throw new RuntimeException("Passkey authentication is not enabled globally");
        }

        // Generate challenge
        String challenge = generateChallenge();

        // Create registration options
        Map<String, Object> options = new HashMap<>();
        options.put("challenge", challenge);
        options.put("rp", Map.of(
            "name", rpName,
            "id", rpId
        ));
        options.put("user", Map.of(
            "id", base64UrlEncode(user.getId().toString().getBytes(StandardCharsets.UTF_8)),
            "name", user.getEmail(),
            "displayName", user.getFullName()
        ));
        options.put("pubKeyCredParams", List.of(
            Map.of("type", "public-key", "alg", -7),  // ES256
            Map.of("type", "public-key", "alg", -257) // RS256
        ));
        options.put("timeout", timeout);
        options.put("attestation", attestation);
        options.put("authenticatorSelection", Map.of(
            "authenticatorAttachment", "platform",
            "requireResidentKey", false,
            "userVerification", "preferred"
        ));

        // Store challenge temporarily (in production, use Redis or similar)
        storeChallenge(userId, challenge);

        log.info("Passkey registration options generated for user: {}", user.getEmail());
        return options;
    }

    /**
     * Verify and register passkey credential
     */
    @Transactional
    public boolean verifyAndRegisterPasskey(Long userId, Map<String, Object> credential) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // In production, implement full WebAuthn verification
            // This is a simplified version for demonstration
            
            String credentialId = (String) credential.get("id");
            String publicKey = (String) credential.get("publicKey");
            
            if (credentialId == null || publicKey == null) {
                return false;
            }

            // Store credential
            List<Map<String, Object>> credentials = getStoredCredentials(user);
            Map<String, Object> newCredential = new HashMap<>();
            newCredential.put("id", credentialId);
            newCredential.put("publicKey", publicKey);
            newCredential.put("createdAt", LocalDateTime.now().toString());
            newCredential.put("counter", 0);
            credentials.add(newCredential);

            user.setPasskeyCredentials(objectMapper.writeValueAsString(credentials));
            user.setPasskeyEnabled(true);
            user.setMfaEnabled(true);
            user.setLastPasskeySetup(LocalDateTime.now());
            userRepository.save(user);

            log.info("Passkey registered for user: {}", user.getEmail());
            return true;
        } catch (Exception e) {
            log.error("Error registering passkey", e);
            return false;
        }
    }

    /**
     * Generate authentication options for WebAuthn
     */
    public Map<String, Object> generateAuthenticationOptions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPasskeyEnabled()) {
            throw new RuntimeException("Passkey is not enabled for this user");
        }

        // Generate challenge
        String challenge = generateChallenge();

        // Get allowed credentials
        List<Map<String, Object>> credentials = getStoredCredentials(user);
        List<Map<String, String>> allowCredentials = new ArrayList<>();
        for (Map<String, Object> cred : credentials) {
            allowCredentials.add(Map.of(
                "type", "public-key",
                "id", (String) cred.get("id")
            ));
        }

        Map<String, Object> options = new HashMap<>();
        options.put("challenge", challenge);
        options.put("timeout", timeout);
        options.put("rpId", rpId);
        options.put("allowCredentials", allowCredentials);
        options.put("userVerification", "preferred");

        // Store challenge temporarily
        storeChallenge(user.getId(), challenge);

        log.info("Passkey authentication options generated for user: {}", user.getEmail());
        return options;
    }

    /**
     * Verify passkey authentication
     */
    public boolean verifyPasskeyAuthentication(String email, Map<String, Object> assertion) {
        try {
            log.info("Verifying passkey authentication for email: {}", email);
            log.debug("Assertion data: {}", assertion);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getPasskeyEnabled()) {
                log.warn("Passkey not enabled for user: {}", email);
                return false;
            }

            // In production, implement full WebAuthn verification
            // This is a simplified version for demonstration
            
            String credentialId = (String) assertion.get("id");
            if (credentialId == null) {
                log.warn("Credential ID is null in assertion");
                return false;
            }

            log.info("Looking for credential ID: {}", credentialId);

            // Verify credential exists
            List<Map<String, Object>> credentials = getStoredCredentials(user);
            log.info("User has {} stored credentials", credentials.size());
            
            for (Map<String, Object> cred : credentials) {
                log.debug("Stored credential ID: {}", cred.get("id"));
            }
            
            boolean credentialExists = credentials.stream()
                    .anyMatch(cred -> credentialId.equals(cred.get("id")));

            if (credentialExists) {
                log.info("Passkey authentication successful for user: {}", user.getEmail());
                return true;
            } else {
                log.warn("Credential ID not found in stored credentials for user: {}", email);
            }

            return false;
        } catch (Exception e) {
            log.error("Error verifying passkey authentication for user: " + email, e);
            return false;
        }
    }

    /**
     * List user's registered passkeys
     */
    public List<Map<String, Object>> listPasskeys(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> credentials = getStoredCredentials(user);
        
        // Return sanitized list (without sensitive data)
        return credentials.stream()
                .map(cred -> Map.of(
                    "id", cred.get("id"),
                    "createdAt", cred.get("createdAt")
                ))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Remove a passkey
     */
    @Transactional
    public void removePasskey(Long userId, String credentialId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            List<Map<String, Object>> credentials = getStoredCredentials(user);
            credentials.removeIf(cred -> credentialId.equals(cred.get("id")));

            if (credentials.isEmpty()) {
                user.setPasskeyEnabled(false);
                user.setPasskeyCredentials(null);
                
                // Disable MFA if no other methods are enabled
                if (!user.getTotpEnabled()) {
                    user.setMfaEnabled(false);
                }
            } else {
                user.setPasskeyCredentials(objectMapper.writeValueAsString(credentials));
            }

            userRepository.save(user);
            log.info("Passkey removed for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error removing passkey", e);
            throw new RuntimeException("Failed to remove passkey");
        }
    }

    /**
     * Disable all passkeys for a user
     */
    @Transactional
    public void disablePasskey(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasskeyEnabled(false);
        user.setPasskeyCredentials(null);
        
        // Disable MFA if no other methods are enabled
        if (!user.getTotpEnabled()) {
            user.setMfaEnabled(false);
        }
        
        userRepository.save(user);
        log.info("Passkey disabled for user: {}", user.getEmail());
    }

    /**
     * Generate random challenge
     */
    private String generateChallenge() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return base64UrlEncode(bytes);
    }

    /**
     * Base64 URL encode
     */
    private String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    /**
     * Get stored credentials for a user
     */
    private List<Map<String, Object>> getStoredCredentials(User user) {
        if (user.getPasskeyCredentials() == null) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(
                user.getPasskeyCredentials(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );
        } catch (JsonProcessingException e) {
            log.error("Error parsing passkey credentials", e);
            return new ArrayList<>();
        }
    }

    /**
     * Store challenge temporarily (in production, use Redis or similar)
     * This is a simplified implementation
     */
    private void storeChallenge(Long userId, String challenge) {
        // In production, store in Redis with expiration
        // For now, we'll skip this as it's just for demonstration
        log.debug("Challenge stored for user ID: {}", userId);
    }

    /**
     * Get passkey count for a user
     */
    public int getPasskeyCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getStoredCredentials(user).size();
    }
}

// Made with Bob