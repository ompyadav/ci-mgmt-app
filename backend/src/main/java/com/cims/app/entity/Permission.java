package com.cims.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Permission Entity representing granular permissions
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Permission name is required")
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "resource", length = 50)
    private String resource;

    @Column(name = "action", length = 50)
    private String action;

    /**
     * Predefined permissions
     */
    // User Management
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_READ = "USER_READ";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_DELETE = "USER_DELETE";
    
    // Idea Management
    public static final String IDEA_CREATE = "IDEA_CREATE";
    public static final String IDEA_READ = "IDEA_READ";
    public static final String IDEA_UPDATE = "IDEA_UPDATE";
    public static final String IDEA_DELETE = "IDEA_DELETE";
    public static final String IDEA_APPROVE = "IDEA_APPROVE";
    public static final String IDEA_REJECT = "IDEA_REJECT";
    
    // Dashboard
    public static final String DASHBOARD_VIEW = "DASHBOARD_VIEW";
    public static final String DASHBOARD_EXECUTIVE = "DASHBOARD_EXECUTIVE";
    
    // Reports
    public static final String REPORT_VIEW = "REPORT_VIEW";
    public static final String REPORT_EXPORT = "REPORT_EXPORT";
    
    // Configuration
    public static final String CONFIG_MANAGE = "CONFIG_MANAGE";
    public static final String ROLE_MANAGE = "ROLE_MANAGE";
    
    // Audit
    public static final String AUDIT_VIEW = "AUDIT_VIEW";
}

// Made with Bob
