package com.cims.app.controller;

import com.cims.app.dto.JwtAuthenticationResponse;
import com.cims.app.dto.LoginRequest;
import com.cims.app.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for user: {}", loginRequest.getEmail());
        JwtAuthenticationResponse response = authenticationService.login(loginRequest);
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

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if authentication service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is running");
    }
}

// Made with Bob
