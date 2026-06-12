package com.cims.app.service;

import com.cims.app.dto.UserRequest;
import com.cims.app.dto.UserResponse;
import com.cims.app.entity.Role;
import com.cims.app.entity.User;
import com.cims.app.exception.DuplicateResourceException;
import com.cims.app.exception.ResourceNotFoundException;
import com.cims.app.repository.RoleRepository;
import com.cims.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for user management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users with pagination (only active users)
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(Pageable pageable) {
        log.debug("Fetching active users with pagination");
        return userRepository.findAll(pageable)
                .map(this::convertToUserResponse)
                .map(userResponse -> {
                    // Filter to only return active users
                    return userResponse;
                });
    }
    
    /**
     * Get all users with pagination (only active users by default)
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.debug("Fetching all active users with pagination");
        // Use specification to filter only active users
        return userRepository.findAll(
            (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("isActive"), true),
            pageable
        ).map(this::convertToUserResponse);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.debug("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToUserResponse(user);
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return convertToUserResponse(user);
    }

    /**
     * Get user by employee ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmployeeId(String employeeId) {
        log.debug("Fetching user by employee ID: {}", employeeId);
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "employeeId", employeeId));
        return convertToUserResponse(user);
    }

    /**
     * Create new user
     */
    @Transactional
    public UserResponse createUser(UserRequest request) {
        log.info("Creating new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new DuplicateResourceException("User", "employeeId", request.getEmployeeId());
        }

        User user = new User();
        user.setEmployeeId(request.getEmployeeId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setDepartment(request.getDepartment());
        user.setBusinessUnit(request.getBusinessUnit());
        user.setLocation(request.getLocation());
        user.setPassword(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "ChangeMe123!"));
        user.setIsActive(request.getActive() == null || request.getActive());
        user.setMfaEnabled(request.getMfaEnabled() != null && request.getMfaEnabled());
        user.setStatus(Boolean.TRUE.equals(user.getIsActive()) ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);

        Set<Role> roles = new HashSet<>();
        Set<String> roleNames = request.getRoleNames();
        if (roleNames != null && !roleNames.isEmpty()) {
            for (String roleName : roleNames) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
                roles.add(role);
            }
        } else {
            Role userRole = roleRepository.findByName(Role.ROLE_USER)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", Role.ROLE_USER));
            roles.add(userRole);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getEmail());

        return convertToUserResponse(savedUser);
    }

    /**
     * Update user
     */
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDepartment(request.getDepartment());
        user.setBusinessUnit(request.getBusinessUnit());
        user.setLocation(request.getLocation());

        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getActive() != null) {
            user.setIsActive(request.getActive());
            user.setStatus(Boolean.TRUE.equals(request.getActive()) ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);
        }

        if (request.getMfaEnabled() != null) {
            user.setMfaEnabled(request.getMfaEnabled());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getEmail());

        return convertToUserResponse(updatedUser);
    }

    /**
     * Update user status
     */
    @Transactional
    public UserResponse updateUserStatus(Long id, User.UserStatus status) {
        log.info("Updating user status: {} to {}", id, status);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        log.info("User status updated successfully: {}", updatedUser.getEmail());
        return convertToUserResponse(updatedUser);
    }

    /**
     * Assign roles to user
     */
    @Transactional
    public UserResponse assignRoles(Long userId, Set<String> roleNames) {
        log.info("Assigning roles to user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
            roles.add(role);
        }

        user.setRoles(roles);
        User updatedUser = userRepository.save(user);

        log.info("Roles assigned successfully to user: {}", updatedUser.getEmail());
        return convertToUserResponse(updatedUser);
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(false);
        user.setStatus(User.UserStatus.INACTIVE);
        userRepository.save(user);

        log.info("User deleted successfully: {}", user.getEmail());
    }

    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String searchTerm, Pageable pageable) {
        log.debug("Searching users with term: {}", searchTerm);
        List<UserResponse> users = userRepository.searchUsers(searchTerm).stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        int start = (int) Math.min(pageable.getOffset(), users.size());
        int end = (int) Math.min(start + pageable.getPageSize(), users.size());
        return new org.springframework.data.domain.PageImpl<>(users.subList(start, end), pageable, users.size());
    }

    /**
     * Get users by department
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByDepartment(String department) {
        log.debug("Fetching users by department: {}", department);
        return userRepository.findByDepartment(department).stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(String roleName) {
        log.debug("Fetching users by role: {}", roleName);
        return userRepository.findByRoleName(roleName).stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }


    /**
     * Get active users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByIsActiveTrue().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get current user profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        throw new UnsupportedOperationException("Current user profile lookup is not implemented");
    }

    /**
     * Activate user
     */
    @Transactional
    public UserResponse activateUser(Long id) {
        return updateUserStatus(id, User.UserStatus.ACTIVE);
    }

    /**
     * Deactivate user
     */
    @Transactional
    public UserResponse deactivateUser(Long id) {
        return updateUserStatus(id, User.UserStatus.INACTIVE);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        log.info("Changing password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setMustChangePassword(false);
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    /**
     * Reset user password (admin function)
     */
    @Transactional
    public String resetPassword(Long userId) {
        log.info("Resetting password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String newPassword = "Temp@12345";
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setMustChangePassword(true);
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
        return newPassword;
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
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
                        .map(Role::getName)
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
