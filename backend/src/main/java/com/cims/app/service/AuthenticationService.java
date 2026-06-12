package com.cims.app.service;

import com.cims.app.dto.JwtAuthenticationResponse;
import com.cims.app.dto.LoginRequest;
import com.cims.app.dto.UserResponse;
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
import java.util.stream.Collectors;

/**
 * Service for authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Authenticate user and generate JWT tokens
     */
    @Transactional
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        log.info("Attempting login for user: {}", loginRequest.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate tokens
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Update last login
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
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
