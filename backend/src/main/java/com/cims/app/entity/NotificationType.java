package com.cims.app.entity;

/**
 * Enum representing the type of notification
 */
public enum NotificationType {
    IDEA_SUBMITTED("Idea Submitted"),
    IDEA_APPROVED("Idea Approved"),
    IDEA_REJECTED("Idea Rejected"),
    IDEA_STATUS_CHANGED("Idea Status Changed"),
    COMMENT_ADDED("Comment Added"),
    APPROVAL_REQUIRED("Approval Required"),
    REMINDER("Reminder"),
    SYSTEM("System Notification");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

// Made with Bob
