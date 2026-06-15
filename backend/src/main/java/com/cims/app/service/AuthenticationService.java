package com.cims.app.service;

import com.cims.app.dto.JwtAuthenticationResponse;
import com.cims.app.dto.LoginRequest;
import com.cims.app.dto.UserResponse;
import com.cims.app.exception.TwoFactorRequiredException;
import com.cims.app.entity.User;
import com.cims.app.repository.UserRepository;
import com.cims.app.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for authentication operations with 2FA, Passkey, and Captcha support
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final TwoFactorAuthService twoFactorAuthService;
    private final PasskeyService passkeyService;
    private final CaptchaService captchaService;
    private final CustomUserDetailsService userDetailsService;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Authenticate user and generate JWT tokens with multi-factor authentication support
     */
    @Transactional
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        return login(loginRequest, null, null);
    }

    /**
     * Enhanced login with 2FA, Passkey, and Captcha support
     */
    @Transactional
    public JwtAuthenticationResponse login(LoginRequest loginRequest, String totpCode, String captchaToken) {
        log.info("Attempting login for user: {}", loginRequest.getEmail());

        // Step 1: Verify Captcha if enabled
        if (captchaService.isCaptchaEnabled() && captchaToken != null) {
            boolean captchaValid = captchaService.verifyCaptcha(captchaToken, null);
            if (!captchaValid) {
                log.warn("Captcha verification failed for user: {}", loginRequest.getEmail());
                throw new RuntimeException("Captcha verification failed");
            }
            log.info("Captcha verification successful for user: {}", loginRequest.getEmail());
        }

        // Step 2: Authenticate user credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Step 3: Get user and check 2FA requirement
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Step 4: Check if 2FA is required and verify
        if (user.getTotpEnabled() != null && user.getTotpEnabled()) {
            if (totpCode == null || totpCode.isEmpty()) {
                log.info("2FA required for user: {}", loginRequest.getEmail());
                throw new TwoFactorRequiredException("Two-factor authentication required");
            }

            // Verify TOTP code or backup code
            boolean verified = twoFactorAuthService.verifyCode(user.getTotpSecret(), totpCode) ||
                             twoFactorAuthService.verifyBackupCode(user, totpCode);

            if (!verified) {
                log.warn("Invalid 2FA code for user: {}", loginRequest.getEmail());
                throw new RuntimeException("Invalid two-factor authentication code");
            }
            log.info("2FA verification successful for user: {}", loginRequest.getEmail());
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Step 5: Generate tokens
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Step 6: Update last login
        user.setLastLogin(LocalDateTime.now());
        user.resetFailedLoginAttempts();
        userRepository.save(user);

        // Build user response
        UserResponse userResponse = buildUserResponse(user);

        log.info("Login successful for user: {}", loginRequest.getEmail());

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000) // Convert to seconds
                .user(userResponse)
                .build();
    }

    /**
     * Authenticate with Passkey
     */
    @Transactional
    public JwtAuthenticationResponse loginWithPasskey(String email, Map<String, Object> assertion, String captchaToken) {
        log.info("Attempting passkey login for user: {}", email);

        // Step 1: Verify Captcha if enabled
        if (captchaService.isCaptchaEnabled() && captchaToken != null) {
            boolean captchaValid = captchaService.verifyCaptcha(captchaToken, null);
            if (!captchaValid) {
                log.warn("Captcha verification failed for passkey login: {}", email);
                throw new RuntimeException("Captcha verification failed");
            }
        }

        // Step 2: Verify passkey
        boolean passkeyValid = passkeyService.verifyPasskeyAuthentication(email, assertion);
        if (!passkeyValid) {
            log.warn("Passkey verification failed for user: {}", email);
            throw new RuntimeException("Passkey authentication failed");
        }

        // Step 3: Get user and create authentication
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                email, null, null
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Step 4: Generate tokens
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Step 5: Update last login
        user.setLastLogin(LocalDateTime.now());
        user.resetFailedLoginAttempts();
        userRepository.save(user);

        UserResponse userResponse = buildUserResponse(user);

        log.info("Passkey login successful for user: {}", email);

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(userResponse)
                .build();
    }

    /**
     * Authenticate with Passkey (simplified for controller)
     */
    @Transactional
    public JwtAuthenticationResponse authenticateWithPasskey(String email) {
        log.info("Authenticating with passkey for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Load user details using CustomUserDetailsService to get proper UserPrincipal
        org.springframework.security.core.userdetails.UserDetails userDetails =
                userDetailsService.loadUserByUsername(email);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate tokens
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        user.resetFailedLoginAttempts();
        userRepository.save(user);

        UserResponse userResponse = buildUserResponse(user);

        log.info("Passkey authentication successful for user: {}", email);

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(userResponse)
                .build();
    }

    /**
     * Check authentication requirements for a user
     */
    public Map<String, Object> checkAuthRequirements(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> requirements = new HashMap<>();
        requirements.put("requires2FA", user.getTotpEnabled() != null && user.getTotpEnabled());
        requirements.put("hasPasskey", user.getPasskeyEnabled() != null && user.getPasskeyEnabled());
        requirements.put("requiresCaptcha", captchaService.isCaptchaEnabled());
        requirements.put("captchaSiteKey", captchaService.getSiteKey());

        return requirements;
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional(readOnly = true)
    public JwtAuthenticationResponse refreshToken(String refreshToken) {
        log.info("Refreshing access token");

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create authentication object
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                username, null, null
        );

        // Generate new access token
        String newAccessToken = tokenProvider.generateToken(authentication);

        UserResponse userResponse = buildUserResponse(user);

        return JwtAuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(userResponse)
                .build();
    }

    /**
     * Logout user
     */
    public void logout() {
        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
    }

    /**
     * Build UserResponse from User entity
     */
    private UserResponse buildUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .businessUnit(user.getBusinessUnit())
                .location(user.getLocation())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .status(user.getStatus().name())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .lastLogin(user.getLastLogin())
                .emailVerified(user.getEmailVerified())
                .mfaEnabled(user.getMfaEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

// Made with Bob
