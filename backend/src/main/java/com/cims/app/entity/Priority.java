package com.cims.app.entity;

/**
 * Enum representing the priority level of an idea
 */
public enum Priority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    CRITICAL("Critical");

    private final String displayName;

    Priority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

// Made with Bob
