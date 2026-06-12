package com.cims.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AuditLog Entity for tracking all system activities
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "entity_name", length = 255)
    private String entityName;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "timestamp", nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "status", length = 20)
    private String status; // SUCCESS, FAILURE

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "request_method", length = 10)
    private String requestMethod; // GET, POST, PUT, DELETE

    @Column(name = "request_url", length = 500)
    private String requestUrl;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "module", length = 50)
    private String module; // USER, IDEA, ROLE, etc.

    /**
     * Action types
     */
    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_READ = "READ";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_DELETE = "DELETE";
    public static final String ACTION_LOGIN = "LOGIN";
    public static final String ACTION_LOGOUT = "LOGOUT";
    public static final String ACTION_LOGIN_FAILED = "LOGIN_FAILED";
    public static final String ACTION_PASSWORD_CHANGE = "PASSWORD_CHANGE";
    public static final String ACTION_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String ACTION_EXPORT = "EXPORT";
    public static final String ACTION_IMPORT = "IMPORT";
    public static final String ACTION_APPROVE = "APPROVE";
    public static final String ACTION_REJECT = "REJECT";

    /**
     * Entity types
     */
    public static final String ENTITY_USER = "USER";
    public static final String ENTITY_IDEA = "IDEA";
    public static final String ENTITY_ROLE = "ROLE";
    public static final String ENTITY_PERMISSION = "PERMISSION";
    public static final String ENTITY_COMMENT = "COMMENT";
    public static final String ENTITY_ATTACHMENT = "ATTACHMENT";
    public static final String ENTITY_NOTIFICATION = "NOTIFICATION";
}

// Made with Bob
