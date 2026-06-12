package com.cims.app.dto;

import com.cims.app.entity.BenefitType;
import com.cims.app.entity.Priority;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Idea creation and update requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaRequest {

    @Size(max = 50, message = "Idea number must not exceed 50 characters")
    private String ideaNumber;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 50, message = "Identified by must not exceed 50 characters")
    private String identifiedBy;

    private LocalDate identifiedOn;

    @Size(max = 100, message = "POD/Team must not exceed 100 characters")
    private String podTeam;

    @Size(max = 100, message = "IBM Delivery Manager must not exceed 100 characters")
    private String ibmDeliveryManager;

    @Size(max = 100, message = "Suncor Manager must not exceed 100 characters")
    private String suncorManager;

    @Size(max = 100, message = "Suncor GM must not exceed 100 characters")
    private String suncorGm;

    @Size(max = 200, message = "Application name must not exceed 200 characters")
    private String applicationName;

    @Size(max = 100, message = "Consultant name must not exceed 100 characters")
    private String consultantName;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 500, message = "Title must be between 5 and 500 characters")
    private String title;

    @NotBlank(message = "Problem statement is required")
    @Size(min = 10, message = "Problem statement must be at least 10 characters")
    private String problemStatement;

    @NotBlank(message = "Proposed solution is required")
    @Size(min = 10, message = "Proposed solution must be at least 10 characters")
    private String proposedSolution;

    private String actualSolutionImplemented;

    @Size(max = 500, message = "Supporting PODs must not exceed 500 characters")
    private String supportingPods;

    @Size(max = 50, message = "ServiceNow ticket must not exceed 50 characters")
    private String serviceNowTicket;

    @Min(value = 0, message = "Expected quantitative benefits (hours) must be non-negative")
    private Integer expectedQuantitativeBenefitsHours;

    @DecimalMin(value = "0.0", message = "Expected quantitative benefits (value) must be non-negative")
    private BigDecimal expectedQuantitativeBenefitsValue;

    private String expectedQualitativeBenefits;

    private BenefitType benefitType;

    @Min(value = 0, message = "Estimated efforts (hours) must be non-negative")
    private Integer estimatedEffortsHours;

    @DecimalMin(value = "0.0", message = "Estimated efforts (value) must be non-negative")
    private BigDecimal estimatedEffortsValue;

    @Min(value = 0, message = "Actual efforts spent (hours) must be non-negative")
    private Integer actualEffortsSpentHours;

    @DecimalMin(value = "0.0", message = "Actual efforts spent (value) must be non-negative")
    private BigDecimal actualEffortsSpentValue;

    private LocalDate implementationDate;

    @Size(max = 100, message = "Sub status must not exceed 100 characters")
    private String subStatus;

    private String suncorGoals;

    private String remarks;

    private Priority priority;
}

// Made with Bob
