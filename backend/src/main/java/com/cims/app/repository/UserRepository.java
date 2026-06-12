package com.cims.app.repository;

import com.cims.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by employee ID
     */
    Optional<User> findByEmployeeId(String employeeId);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if employee ID exists
     */
    boolean existsByEmployeeId(String employeeId);

    /**
     * Find users by status
     */
    List<User> findByStatus(User.UserStatus status);

    /**
     * Find users by department
     */
    List<User> findByDepartment(String department);

    /**
     * Find users by business unit
     */
    List<User> findByBusinessUnit(String businessUnit);

    /**
     * Find users by manager
     */
    List<User> findByManagerId(Long managerId);

    /**
     * Find users by role name
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    /**
     * Find active users
     */
    List<User> findByIsActiveTrue();

    /**
     * Find locked accounts
     */
    List<User> findByAccountLockedTrue();

    /**
     * Search users by name or email
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);

    /**
     * Find user by password reset token
     */
    Optional<User> findByPasswordResetToken(String token);

    /**
     * Find user by email verification token
     */
    Optional<User> findByEmailVerificationToken(String token);

    /**
     * Count users by status
     */
    long countByStatus(User.UserStatus status);

    /**
     * Count users by department
     */
    long countByDepartment(String department);
}

// Made with Bob
