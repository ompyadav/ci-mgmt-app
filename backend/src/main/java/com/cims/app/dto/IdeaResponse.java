package com.cims.app.dto;

import com.cims.app.entity.BenefitType;
import com.cims.app.entity.IdeaStatus;
import com.cims.app.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Idea responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaResponse {

    private Long id;
    private String ideaNumber;
    private String category;
    private String identifiedBy;
    private LocalDate identifiedOn;
    private String podTeam;
    private String ibmDeliveryManager;
    private String suncorManager;
    private String suncorGm;
    private String applicationName;
    private String consultantName;
    private String title;
    private String problemStatement;
    private String proposedSolution;
    private String actualSolutionImplemented;
    private String supportingPods;
    private String serviceNowTicket;
    private Integer expectedQuantitativeBenefitsHours;
    private BigDecimal expectedQuantitativeBenefitsValue;
    private String expectedQualitativeBenefits;
    private BenefitType benefitType;
    private Integer estimatedEffortsHours;
    private BigDecimal estimatedEffortsValue;
    private Integer actualEffortsSpentHours;
    private BigDecimal actualEffortsSpentValue;
    private LocalDate implementationDate;
    private IdeaStatus status;
    private String subStatus;
    private String reasonForRejection;
    private String suncorGoals;
    private String remarks;
    private Priority priority;
    private BigDecimal roi;
    private String ideaOwnerName;
    private String reviewerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Made with Bob
