package com.cims.app.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * IdeaWorkflowHistory Entity for tracking workflow state changes
 */
@Entity
@Table(name = "idea_workflow_history", indexes = {
    @Index(name = "idx_workflow_idea", columnList = "idea_id"),
    @Index(name = "idx_workflow_date", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaWorkflowHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false)
    private Idea idea;

    @Column(name = "from_status", length = 50)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 50)
    private String toStatus;

    @Column(name = "from_sub_status", length = 50)
    private String fromSubStatus;

    @Column(name = "to_sub_status", length = 50)
    private String toSubStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "action_type", length = 50)
    private String actionType; // SUBMIT, APPROVE, REJECT, UPDATE, IMPLEMENT, CLOSE

    @Column(name = "duration_in_status")
    private Long durationInStatus; // Duration in previous status (in days)

    /**
     * Action types
     */
    public static final String ACTION_SUBMIT = "SUBMIT";
    public static final String ACTION_APPROVE = "APPROVE";
    public static final String ACTION_REJECT = "REJECT";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_IMPLEMENT = "IMPLEMENT";
    public static final String ACTION_CLOSE = "CLOSE";
    public static final String ACTION_REOPEN = "REOPEN";
    public static final String ACTION_ARCHIVE = "ARCHIVE";
    public static final String ACTION_REQUEST_INFO = "REQUEST_INFO";
}

// Made with Bob
