package com.cims.app.entity;

/**
 * Enum representing the status of an idea in the workflow
 */
public enum IdeaStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    UNDER_REVIEW("Under Review"),
    MORE_INFO_REQUIRED("More Information Required"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    IN_PROGRESS("In Progress"),
    IMPLEMENTED("Implemented"),
    BENEFITS_REALIZED("Benefits Realized"),
    CLOSED("Closed"),
    ON_HOLD("On Hold");

    private final String displayName;

    IdeaStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

// Made with Bob
