package com.cims.app.entity;

/**
 * Enum representing the type of benefit from an idea
 */
public enum BenefitType {
    ONE_TIME("One Time"),
    RECURRING("Recurring");

    private final String displayName;

    BenefitType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

// Made with Bob
