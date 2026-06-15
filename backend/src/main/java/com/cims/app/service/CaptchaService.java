package com.cims.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for Captcha verification (Google reCAPTCHA)
 * Supports both reCAPTCHA v2 and v3
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaptchaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth.captcha.enabled:false}")
    private boolean captchaEnabled;

    @Value("${auth.captcha.provider:recaptcha}")
    private String captchaProvider;

    @Value("${auth.captcha.site-key:}")
    private String siteKey;

    @Value("${auth.captcha.secret-key:}")
    private String secretKey;

    @Value("${auth.captcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    @Value("${auth.captcha.threshold:0.5}")
    private double threshold;

    /**
     * Check if Captcha is globally enabled
     */
    public boolean isCaptchaEnabled() {
        return captchaEnabled;
    }

    /**
     * Get site key for frontend
     */
    public String getSiteKey() {
        return siteKey;
    }

    /**
     * Verify captcha token
     */
    public boolean verifyCaptcha(String token, String remoteIp) {
        if (!captchaEnabled) {
            log.debug("Captcha verification skipped - captcha is disabled");
            return true;
        }

        if (token == null || token.isEmpty()) {
            log.warn("Captcha verification failed - token is empty");
            return false;
        }

        if (secretKey == null || secretKey.isEmpty()) {
            log.error("Captcha secret key is not configured");
            return false;
        }

        try {
            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secretKey);
            params.add("response", token);
            if (remoteIp != null && !remoteIp.isEmpty()) {
                params.add("remoteip", remoteIp);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // Send verification request
            ResponseEntity<Map> response = restTemplate.postForEntity(
                verifyUrl,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Boolean success = (Boolean) body.get("success");

                if (Boolean.TRUE.equals(success)) {
                    // For reCAPTCHA v3, check score
                    if (body.containsKey("score")) {
                        Double score = ((Number) body.get("score")).doubleValue();
                        boolean passed = score >= threshold;
                        log.info("Captcha verification - Score: {}, Threshold: {}, Passed: {}", 
                                score, threshold, passed);
                        return passed;
                    }
                    
                    // For reCAPTCHA v2, success is enough
                    log.info("Captcha verification successful");
                    return true;
                } else {
                    Object errorCodes = body.get("error-codes");
                    log.warn("Captcha verification failed - Error codes: {}", errorCodes);
                    return false;
                }
            }

            log.error("Captcha verification failed - Invalid response");
            return false;

        } catch (Exception e) {
            log.error("Error verifying captcha", e);
            return false;
        }
    }

    /**
     * Verify captcha with detailed response
     */
    public CaptchaVerificationResult verifyCaptchaDetailed(String token, String remoteIp) {
        if (!captchaEnabled) {
            return CaptchaVerificationResult.builder()
                    .success(true)
                    .message("Captcha is disabled")
                    .build();
        }

        if (token == null || token.isEmpty()) {
            return CaptchaVerificationResult.builder()
                    .success(false)
                    .message("Captcha token is required")
                    .build();
        }

        if (secretKey == null || secretKey.isEmpty()) {
            return CaptchaVerificationResult.builder()
                    .success(false)
                    .message("Captcha is not properly configured")
                    .build();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secretKey);
            params.add("response", token);
            if (remoteIp != null && !remoteIp.isEmpty()) {
                params.add("remoteip", remoteIp);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                verifyUrl,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Boolean success = (Boolean) body.get("success");

                CaptchaVerificationResult.CaptchaVerificationResultBuilder builder = 
                    CaptchaVerificationResult.builder()
                        .success(Boolean.TRUE.equals(success));

                if (body.containsKey("score")) {
                    Double score = ((Number) body.get("score")).doubleValue();
                    builder.score(score);
                    
                    if (score < threshold) {
                        builder.success(false)
                               .message("Captcha score too low: " + score);
                    }
                }

                if (body.containsKey("challenge_ts")) {
                    builder.challengeTimestamp((String) body.get("challenge_ts"));
                }

                if (body.containsKey("hostname")) {
                    builder.hostname((String) body.get("hostname"));
                }

                if (body.containsKey("error-codes")) {
                    builder.errorCodes((java.util.List<String>) body.get("error-codes"));
                }

                if (Boolean.TRUE.equals(success)) {
                    builder.message("Captcha verification successful");
                } else if (!builder.build().getMessage().isEmpty()) {
                    // Message already set
                } else {
                    builder.message("Captcha verification failed");
                }

                return builder.build();
            }

            return CaptchaVerificationResult.builder()
                    .success(false)
                    .message("Invalid response from captcha service")
                    .build();

        } catch (Exception e) {
            log.error("Error verifying captcha", e);
            return CaptchaVerificationResult.builder()
                    .success(false)
                    .message("Error verifying captcha: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get captcha configuration for frontend
     */
    public Map<String, Object> getCaptchaConfig() {
        return Map.of(
            "enabled", captchaEnabled,
            "provider", captchaProvider,
            "siteKey", siteKey != null ? siteKey : "",
            "threshold", threshold
        );
    }

    /**
     * Captcha verification result
     */
    @lombok.Data
    @lombok.Builder
    public static class CaptchaVerificationResult {
        private boolean success;
        private String message;
        private Double score;
        private String challengeTimestamp;
        private String hostname;
        private java.util.List<String> errorCodes;
    }
}

// Made with Bob