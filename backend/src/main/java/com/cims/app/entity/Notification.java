package com.cims.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Notification Entity for in-app notifications
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_read", columnList = "is_read"),
    @Index(name = "idx_notification_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "notification_type", length = 50)
    private String notificationType;

    @Column(name = "reference_type", length = 50)
    private String referenceType; // IDEA, USER, COMMENT, etc.

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "priority", length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Notification types
     */
    public static final String TYPE_IDEA_SUBMITTED = "IDEA_SUBMITTED";
    public static final String TYPE_IDEA_APPROVED = "IDEA_APPROVED";
    public static final String TYPE_IDEA_REJECTED = "IDEA_REJECTED";
    public static final String TYPE_IDEA_UPDATED = "IDEA_UPDATED";
    public static final String TYPE_COMMENT_ADDED = "COMMENT_ADDED";
    public static final String TYPE_COMMENT_REPLY = "COMMENT_REPLY";
    public static final String TYPE_MENTION = "MENTION";
    public static final String TYPE_APPROVAL_REQUIRED = "APPROVAL_REQUIRED";
    public static final String TYPE_STATUS_CHANGED = "STATUS_CHANGED";
    public static final String TYPE_ASSIGNED = "ASSIGNED";
    public static final String TYPE_REMINDER = "REMINDER";
    public static final String TYPE_SYSTEM = "SYSTEM";

    /**
     * Reference types
     */
    public static final String REF_IDEA = "IDEA";
    public static final String REF_USER = "USER";
    public static final String REF_COMMENT = "COMMENT";
    public static final String REF_ATTACHMENT = "ATTACHMENT";
}

// Made with Bob
