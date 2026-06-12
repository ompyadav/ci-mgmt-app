package com.cims.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Idea Entity representing Continuous Improvement ideas
 */
@Entity
@Table(name = "ideas", indexes = {
    @Index(name = "idx_idea_number", columnList = "idea_number"),
    @Index(name = "idx_idea_status", columnList = "status"),
    @Index(name = "idx_idea_category", columnList = "category"),
    @Index(name = "idx_idea_owner", columnList = "idea_owner_id"),
    @Index(name = "idx_idea_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idea extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idea_number", unique = true, nullable = false, length = 50)
    private String ideaNumber;

    @NotBlank(message = "Category is required")
    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "identified_by", length = 50)
    private String identifiedBy; // IBM / Suncor

    @Column(name = "identified_on")
    private LocalDate identifiedOn;

    @Column(name = "pod_team", length = 100)
    private String podTeam;

    @Column(name = "ibm_delivery_manager", length = 100)
    private String ibmDeliveryManager;

    @Column(name = "suncor_manager", length = 100)
    private String suncorManager;

    @Column(name = "suncor_gm", length = 100)
    private String suncorGm;

    @Column(name = "application_name", length = 200)
    private String applicationName;

    @Column(name = "consultant_name", length = 100)
    private String consultantName;

    @NotBlank(message = "Idea title is required")
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "problem_statement", columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "proposed_solution", columnDefinition = "TEXT")
    private String proposedSolution;

    @Column(name = "actual_solution_implemented", columnDefinition = "TEXT")
    private String actualSolutionImplemented;

    @Column(name = "supporting_pods_teams", length = 500)
    private String supportingPodsTeams;

    @Column(name = "servicenow_ticket", length = 100)
    private String servicenowTicket;

    @Column(name = "expected_quantitative_benefits_hours", precision = 10, scale = 2)
    private BigDecimal expectedQuantitativeBenefitsHours;

    @Column(name = "expected_quantitative_benefits_value", precision = 15, scale = 2)
    private BigDecimal expectedQuantitativeBenefitsValue;

    @Column(name = "expected_qualitative_benefits", columnDefinition = "TEXT")
    private String expectedQualitativeBenefits;

    @Column(name = "benefit_type", length = 50)
    private String benefitType; // One time / Recurring

    @Column(name = "estimated_efforts_hours", precision = 10, scale = 2)
    private BigDecimal estimatedEffortsHours;

    @Column(name = "estimated_efforts_value", precision = 15, scale = 2)
    private BigDecimal estimatedEffortsValue;

    @Column(name = "actual_efforts_spent_hours", precision = 10, scale = 2)
    private BigDecimal actualEffortsSpentHours;

    @Column(name = "actual_efforts_spent_value", precision = 15, scale = 2)
    private BigDecimal actualEffortsSpentValue;

    @Column(name = "implementation_date")
    private LocalDate implementationDate;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "sub_status", length = 50)
    private String subStatus;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "suncor_goals", columnDefinition = "TEXT")
    private String suncorGoals;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_owner_id")
    private User ideaOwner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IdeaAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IdeaComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IdeaWorkflowHistory> workflowHistory = new ArrayList<>();

    @Column(name = "actual_quantitative_benefits_hours", precision = 10, scale = 2)
    private BigDecimal actualQuantitativeBenefitsHours;

    @Column(name = "actual_quantitative_benefits_value", precision = 15, scale = 2)
    private BigDecimal actualQuantitativeBenefitsValue;

    @Column(name = "roi_percentage", precision = 5, scale = 2)
    private BigDecimal roiPercentage;

    @Column(name = "priority", length = 20)
    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "complexity", length = 20)
    private String complexity; // LOW, MEDIUM, HIGH

    @Column(name = "impact_score", precision = 3, scale = 1)
    private BigDecimal impactScore;

    @Column(name = "feasibility_score", precision = 3, scale = 1)
    private BigDecimal feasibilityScore;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "approved_date")
    private LocalDate approvedDate;

    @Column(name = "rejected_date")
    private LocalDate rejectedDate;

    @Column(name = "closed_date")
    private LocalDate closedDate;

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    @Column(name = "archived_date")
    private LocalDate archivedDate;

    @Column(name = "tags", length = 500)
    private String tags;

    // Helper methods
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (ideaNumber == null || ideaNumber.isEmpty()) {
            generateIdeaNumber();
        }
    }

    private void generateIdeaNumber() {
        // Format: IDEA-YYYY-NNNN
        String year = String.valueOf(LocalDate.now().getYear());
        // This will be properly generated in service layer with sequence
        this.ideaNumber = "IDEA-" + year + "-TEMP";
    }

    public void calculateROI() {
        if (actualQuantitativeBenefitsValue != null && actualEffortsSpentValue != null 
            && actualEffortsSpentValue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal roi = actualQuantitativeBenefitsValue
                .subtract(actualEffortsSpentValue)
                .divide(actualEffortsSpentValue, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));
            this.roiPercentage = roi;
        }
    }

    /**
     * Predefined categories
     */
    public static final String CATEGORY_AUTOMATION = "Automation";
    public static final String CATEGORY_GEN_AI = "Gen AI";
    public static final String CATEGORY_BUSINESS_PROCESS = "Business Process Improvement";
    public static final String CATEGORY_IT_PROCESS = "IT Process Improvement";
    public static final String CATEGORY_PROCESS = "Process Improvement";
    public static final String CATEGORY_RELIABILITY = "Reliability";
    public static final String CATEGORY_INNOVATION = "Innovation";

    /**
     * Predefined statuses
     */
    public static final String STATUS_DRAFT = "Draft";
    public static final String STATUS_UNDER_REVIEW = "Under Review";
    public static final String STATUS_APPROVED = "Approved";
    public static final String STATUS_UNDER_DEVELOPMENT = "Under Development";
    public static final String STATUS_ON_HOLD = "On Hold";
    public static final String STATUS_REJECTED = "Rejected";
    public static final String STATUS_IMPLEMENTED = "Implemented";
    public static final String STATUS_CLOSED = "Closed";

    /**
     * Predefined sub-statuses
     */
    public static final String SUB_STATUS_SD = "SD";
    public static final String SUB_STATUS_PO = "PO";
    public static final String SUB_STATUS_BUSINESS = "Business";
    public static final String SUB_STATUS_CCB = "CCB";
    public static final String SUB_STATUS_IBM_INTERNAL = "IBM Internal";
}

// Made with Bob
