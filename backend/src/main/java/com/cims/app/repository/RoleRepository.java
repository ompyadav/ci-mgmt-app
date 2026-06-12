package com.cims.app.repository;

import com.cims.app.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Role entity
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by name
     */
    Optional<Role> findByName(String name);

    /**
     * Check if role exists by name
     */
    boolean existsByName(String name);

    /**
     * Find system roles
     */
    List<Role> findByIsSystemRoleTrue();

    /**
     * Find active roles
     */
    List<Role> findByIsActiveTrue();

    /**
     * Find non-system roles
     */
    List<Role> findByIsSystemRoleFalse();
}

// Made with Bob
