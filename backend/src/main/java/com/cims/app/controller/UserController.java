package com.cims.app.controller;

import com.cims.app.dto.UserRequest;
import com.cims.app.dto.UserResponse;
import com.cims.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for User Management
 * Provides endpoints for CRUD operations on users
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Get all users with pagination
     * GET /api/users
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/users - Fetching all users");
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("GET /api/users/{} - Fetching user by ID", id);
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Get current user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        log.info("GET /api/users/me - Fetching current user profile");
        UserResponse user = userService.getCurrentUserProfile();
        return ResponseEntity.ok(user);
    }

    /**
     * Create new user
     * POST /api/users
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER_CREATE', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        log.info("POST /api/users - Creating new user: {}", request.getEmail());
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Update user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER_UPDATE', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        log.info("PUT /api/users/{} - Updating user", id);
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER_DELETE', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /api/users/{} - Deleting user", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Activate user
     * POST /api/users/{id}/activate
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyAuthority('USER_UPDATE', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        log.info("POST /api/users/{}/activate - Activating user", id);
        UserResponse user = userService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Deactivate user
     * POST /api/users/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyAuthority('USER_UPDATE', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        log.info("POST /api/users/{}/deactivate - Deactivating user", id);
        UserResponse user = userService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Change user password
     * POST /api/users/{id}/change-password
     */
    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasAnyAuthority('USER_UPDATE', 'ROLE_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {
        log.info("POST /api/users/{}/change-password - Changing password", id);
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        userService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * Reset user password (admin only)
     * POST /api/users/{id}/reset-password
     */
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('USER_UPDATE', 'ROLE_ADMIN')")
    public ResponseEntity<String> resetPassword(@PathVariable Long id) {
        log.info("POST /api/users/{}/reset-password - Resetting password", id);
        String newPassword = userService.resetPassword(id);
        return ResponseEntity.ok("Password reset successfully. New password: " + newPassword);
    }

    /**
     * Assign roles to user
     * POST /api/users/{id}/roles
     */
    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<UserResponse> assignRoles(
            @PathVariable Long id,
            @RequestBody List<String> roleNames) {
        log.info("POST /api/users/{}/roles - Assigning roles: {}", id, roleNames);
        UserResponse user = userService.assignRoles(id, new java.util.HashSet<>(roleNames));
        return ResponseEntity.ok(user);
    }

    /**
     * Search users
     * GET /api/users/search?q={searchTerm}
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("GET /api/users/search?q={} - Searching users", q);
        Page<UserResponse> users = userService.searchUsers(q, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by department
     * GET /api/users/department/{department}
     */
    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByDepartment(@PathVariable String department) {
        log.info("GET /api/users/department/{} - Fetching users by department", department);
        List<UserResponse> users = userService.getUsersByDepartment(department);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by role
     * GET /api/users/role/{roleName}
     */
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String roleName) {
        log.info("GET /api/users/role/{} - Fetching users by role", roleName);
        List<UserResponse> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(users);
    }

    /**
     * Get active users
     * GET /api/users/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        log.info("GET /api/users/active - Fetching active users");
        List<UserResponse> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user statistics
     * GET /api/users/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        log.info("GET /api/users/statistics - Fetching user statistics");
        Map<String, Object> statistics = Map.of(
            "totalUsers", userService.getAllUsers(Pageable.unpaged()).getTotalElements(),
            "activeUsers", userService.getActiveUsers().size()
        );
        return ResponseEntity.ok(statistics);
    }
}

// Made with Bob
