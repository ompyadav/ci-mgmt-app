package com.cims.app.service;

import com.cims.app.dto.IdeaRequest;
import com.cims.app.dto.IdeaResponse;
import com.cims.app.entity.*;
import com.cims.app.exception.DuplicateResourceException;
import com.cims.app.exception.ResourceNotFoundException;
import com.cims.app.exception.UnauthorizedException;
import com.cims.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Continuous Improvement Ideas
 * Handles CRUD operations, workflow management, and business logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    /**
     * Create a new idea
     */
    public IdeaResponse createIdea(IdeaRequest request) {
        log.info("Creating new idea: {}", request.getTitle());

        // Get current user
        User currentUser = getCurrentUser();

        // Validate idea number uniqueness if provided
        if (request.getIdeaNumber() != null && ideaRepository.existsByIdeaNumber(request.getIdeaNumber())) {
            throw new DuplicateResourceException("Idea number already exists: " + request.getIdeaNumber());
        }

        // Get or validate category
        Category category = categoryRepository.findByName(request.getCategory())
                .filter(existing -> Category.TYPE_IDEA_CATEGORY.equals(existing.getCategoryType()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategory()));

        // Create idea entity
        Idea idea = new Idea();
        mapRequestToEntity(request, idea);
        idea.setIdeaOwner(currentUser);
        idea.setStatus(Idea.STATUS_DRAFT);
        idea.setCreatedBy(currentUser.getEmail());
        idea.setUpdatedBy(currentUser.getEmail());

        // Generate idea number if not provided
        if (idea.getIdeaNumber() == null) {
            idea.setIdeaNumber(generateIdeaNumber());
        }

        // Calculate ROI
        calculateROI(idea);

        // Save idea
        Idea savedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_CREATED", "Created idea: " + savedIdea.getTitle(), savedIdea.getId());

        log.info("Idea created successfully with ID: {}", savedIdea.getId());
        return mapEntityToResponse(savedIdea);
    }

    /**
     * Get idea by ID
     */
    @Transactional(readOnly = true)
    public IdeaResponse getIdeaById(Long id) {
        log.info("Fetching idea with ID: {}", id);
        Idea idea = findIdeaById(id);
        return mapEntityToResponse(idea);
    }

    /**
     * Get all ideas with pagination
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> getAllIdeas(Pageable pageable) {
        log.info("Fetching all ideas with pagination");
        return ideaRepository.findAll(pageable)
                .map(this::mapEntityToResponse);
    }

    /**
     * Get all ideas with filters (status, priority, search)
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> getAllIdeasWithFilters(IdeaStatus status, String priority, String search, Pageable pageable) {
        log.info("Fetching ideas with filters - status: {}, priority: {}, search: {}", status, priority, search);
        
        Page<Idea> ideasPage;
        
        // If search term is provided, use search functionality
        if (search != null && !search.trim().isEmpty()) {
            ideasPage = ideaRepository.searchIdeas(search.trim(), pageable);
        } else {
            ideasPage = ideaRepository.findAll(pageable);
        }
        
        // Apply filters
        List<IdeaResponse> filteredIdeas = ideasPage.getContent().stream()
                .filter(idea -> {
                    // Filter by status if provided
                    if (status != null && !status.getDisplayName().equals(idea.getStatus())) {
                        return false;
                    }
                    // Filter by priority if provided
                    if (priority != null && !priority.isEmpty() && !priority.equals(idea.getPriority())) {
                        return false;
                    }
                    return true;
                })
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                filteredIdeas,
                pageable,
                ideasPage.getTotalElements()
        );
    }

    /**
     * Update idea
     */
    public IdeaResponse updateIdea(Long id, IdeaRequest request) {
        log.info("Updating idea with ID: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if user has permission to update
        if (!canUserModifyIdea(idea, currentUser)) {
            throw new UnauthorizedException("You don't have permission to update this idea");
        }

        // Validate idea number uniqueness if changed
        if (request.getIdeaNumber() != null && 
            !request.getIdeaNumber().equals(idea.getIdeaNumber()) &&
            ideaRepository.existsByIdeaNumber(request.getIdeaNumber())) {
            throw new DuplicateResourceException("Idea number already exists: " + request.getIdeaNumber());
        }

        // Update fields
        mapRequestToEntity(request, idea);
        idea.setUpdatedBy(currentUser.getEmail());

        // Recalculate ROI
        calculateROI(idea);

        // Save changes
        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_UPDATED", "Updated idea: " + updatedIdea.getTitle(), updatedIdea.getId());

        log.info("Idea updated successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Delete idea
     */
    public void deleteIdea(Long id) {
        log.info("Deleting idea with ID: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if user has permission to delete
        if (!canUserModifyIdea(idea, currentUser)) {
            throw new UnauthorizedException("You don't have permission to delete this idea");
        }

        // Create audit log before deletion
        createAuditLog("IDEA_DELETED", "Deleted idea: " + idea.getTitle(), idea.getId());

        ideaRepository.delete(idea);
        log.info("Idea deleted successfully: {}", id);
    }

    /**
     * Submit idea for review
     */
    public IdeaResponse submitIdea(Long id) {
        log.info("Submitting idea for review: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        if (!idea.getIdeaOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the idea owner can submit the idea");
        }

        if (!Idea.STATUS_DRAFT.equals(idea.getStatus())) {
            throw new IllegalStateException("Only draft ideas can be submitted");
        }

        idea.setStatus(IdeaStatus.SUBMITTED.getDisplayName());
        idea.setUpdatedBy(currentUser.getEmail());

        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_SUBMITTED", "Submitted idea for review: " + idea.getTitle(), idea.getId());

        // Send notification to reviewers
        notificationService.notifyReviewers(updatedIdea);
        
        // Send email notifications to reviewers/managers
        sendEmailToReviewers(updatedIdea);

        log.info("Idea submitted successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Approve idea
     */
    public IdeaResponse approveIdea(Long id, String comments) {
        log.info("Approving idea: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if user has approval permission
        if (!hasApprovalPermission(currentUser)) {
            throw new UnauthorizedException("You don't have permission to approve ideas");
        }

        if (!IdeaStatus.SUBMITTED.getDisplayName().equals(idea.getStatus())
                && !IdeaStatus.UNDER_REVIEW.getDisplayName().equals(idea.getStatus())) {
            throw new IllegalStateException("Only submitted or under review ideas can be approved");
        }

        idea.setStatus(IdeaStatus.APPROVED.getDisplayName());
        idea.setReviewer(currentUser);
        idea.setUpdatedBy(currentUser.getEmail());

        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_APPROVED", "Approved idea: " + idea.getTitle() + ". Comments: " + comments, idea.getId());

        // Send notification to idea owner
        notificationService.notifyIdeaOwner(updatedIdea, "Your idea has been approved");
        
        // Send email notification to idea owner
        String approverName = currentUser.getFirstName() + " " + currentUser.getLastName();
        emailService.sendIdeaApprovedEmail(updatedIdea, approverName, comments);

        log.info("Idea approved successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Reject idea
     */
    public IdeaResponse rejectIdea(Long id, String reason) {
        log.info("Rejecting idea: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if user has approval permission
        if (!hasApprovalPermission(currentUser)) {
            throw new UnauthorizedException("You don't have permission to reject ideas");
        }

        if (!IdeaStatus.SUBMITTED.getDisplayName().equals(idea.getStatus())
                && !IdeaStatus.UNDER_REVIEW.getDisplayName().equals(idea.getStatus())) {
            throw new IllegalStateException("Only submitted or under review ideas can be rejected");
        }

        idea.setStatus(IdeaStatus.REJECTED.getDisplayName());
        idea.setReviewer(currentUser);
        idea.setRejectionReason(reason);
        idea.setUpdatedBy(currentUser.getEmail());

        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_REJECTED", "Rejected idea: " + idea.getTitle() + ". Reason: " + reason, idea.getId());

        // Send notification to idea owner
        notificationService.notifyIdeaOwner(updatedIdea, "Your idea has been rejected");
        
        // Send email notification to idea owner
        String reviewerName = currentUser.getFirstName() + " " + currentUser.getLastName();
        emailService.sendIdeaRejectedEmail(updatedIdea, reviewerName, reason);

        log.info("Idea rejected successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Mark idea as implemented
     */
    public IdeaResponse markAsImplemented(Long id, String actualSolutionImplemented, String comments) {
        log.info("Marking idea as implemented: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if idea is approved
        if (!IdeaStatus.APPROVED.getDisplayName().equals(idea.getStatus())) {
            throw new IllegalStateException("Only approved ideas can be marked as implemented");
        }

        idea.setStatus(IdeaStatus.IMPLEMENTED.getDisplayName());
        idea.setImplementationDate(LocalDate.now());
        
        // Set actual solution implemented if provided
        if (actualSolutionImplemented != null && !actualSolutionImplemented.trim().isEmpty()) {
            idea.setActualSolutionImplemented(actualSolutionImplemented);
        }
        
        idea.setUpdatedBy(currentUser.getEmail());

        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        String auditMessage = "Marked idea as implemented: " + idea.getTitle();
        if (actualSolutionImplemented != null && !actualSolutionImplemented.trim().isEmpty()) {
            auditMessage += ". Actual Solution: " + actualSolutionImplemented;
        }
        if (comments != null && !comments.trim().isEmpty()) {
            auditMessage += ". Comments: " + comments;
        }
        createAuditLog("IDEA_IMPLEMENTED", auditMessage, idea.getId());

        // Send notification to idea owner
        notificationService.notifyIdeaOwner(updatedIdea, "Your idea has been marked as implemented");
        
        // Send email notification to idea owner
        String implementedBy = currentUser.getFirstName() + " " + currentUser.getLastName();
        emailService.sendIdeaImplementedEmail(updatedIdea, implementedBy);

        log.info("Idea marked as implemented successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Revert rejected idea back to draft
     */
    public IdeaResponse revertToDraft(Long id) {
        log.info("Reverting idea to draft: {}", id);

        Idea idea = findIdeaById(id);
        User currentUser = getCurrentUser();

        // Check if idea is rejected
        if (!IdeaStatus.REJECTED.getDisplayName().equals(idea.getStatus())) {
            throw new IllegalStateException("Only rejected ideas can be reverted to draft");
        }

        // Check if user is the idea owner
        if (!idea.getIdeaOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the idea owner can revert a rejected idea to draft");
        }

        idea.setStatus(IdeaStatus.DRAFT.getDisplayName());
        idea.setRejectionReason(null);
        idea.setReviewer(null);
        idea.setUpdatedBy(currentUser.getEmail());

        Idea updatedIdea = ideaRepository.save(idea);

        // Create audit log
        createAuditLog("IDEA_REVERTED_TO_DRAFT", "Reverted rejected idea to draft: " + idea.getTitle(), idea.getId());

        log.info("Idea reverted to draft successfully: {}", id);
        return mapEntityToResponse(updatedIdea);
    }

    /**
     * Get ideas by status
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> getIdeasByStatus(IdeaStatus status, Pageable pageable) {
        log.info("Fetching ideas with status: {}", status);
        Page<Idea> ideasPage = ideaRepository.findAll(pageable);
        List<IdeaResponse> filtered = ideasPage.getContent().stream()
                .filter(idea -> status.getDisplayName().equals(idea.getStatus()))
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
    }

    /**
     * Get ideas by category
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> getIdeasByCategory(String category, Pageable pageable) {
        log.info("Fetching ideas with category: {}", category);
        Page<Idea> ideasPage = ideaRepository.findAll(pageable);
        List<IdeaResponse> filtered = ideasPage.getContent().stream()
                .filter(idea -> category.equals(idea.getCategory()))
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
    }

    /**
     * Get my ideas (current user)
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> getMyIdeas(Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("Fetching ideas for user: {} (ID: {})", currentUser.getEmail(), currentUser.getId());
        
        // Use proper repository query instead of filtering in memory
        Page<Idea> ideasPage = ideaRepository.findByIdeaOwnerId(currentUser.getId(), pageable);
        
        log.info("Found {} ideas for user {}", ideasPage.getTotalElements(), currentUser.getEmail());
        
        return ideasPage.map(this::mapEntityToResponse);
    }

    /**
     * Search ideas
     */
    @Transactional(readOnly = true)
    public Page<IdeaResponse> searchIdeas(String searchTerm, Pageable pageable) {
        log.info("Searching ideas with term: {}", searchTerm);
        return ideaRepository.searchIdeas(searchTerm, pageable)
                .map(this::mapEntityToResponse);
    }

    /**
     * Get ideas by date range
     */
    @Transactional(readOnly = true)
    public List<IdeaResponse> getIdeasByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching ideas between {} and {}", startDate, endDate);
        return ideaRepository.findAll().stream()
                .filter(idea -> idea.getIdentifiedOn() != null
                        && !idea.getIdentifiedOn().isBefore(startDate)
                        && !idea.getIdentifiedOn().isAfter(endDate))
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get ideas statistics
     */
    @Transactional(readOnly = true)
    public IdeaStatistics getStatistics() {
        log.info("Calculating idea statistics");
        
        long totalIdeas = ideaRepository.count();
        long approvedIdeas = ideaRepository.countByStatus(IdeaStatus.APPROVED.getDisplayName());
        long rejectedIdeas = ideaRepository.countByStatus(IdeaStatus.REJECTED.getDisplayName());
        long pendingIdeas = ideaRepository.countByStatus(IdeaStatus.SUBMITTED.getDisplayName());

        BigDecimal totalBenefits = ideaRepository.findAll().stream()
                .map(Idea::getExpectedQuantitativeBenefitsValue)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalROI = ideaRepository.findAll().stream()
                .map(Idea::getRoiPercentage)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return IdeaStatistics.builder()
                .totalIdeas(totalIdeas)
                .approvedIdeas(approvedIdeas)
                .rejectedIdeas(rejectedIdeas)
                .pendingIdeas(pendingIdeas)
                .totalBenefits(totalBenefits != null ? totalBenefits : BigDecimal.ZERO)
                .totalROI(totalROI != null ? totalROI : BigDecimal.ZERO)
                .build();
    }

    // Helper methods

    private Idea findIdeaById(Long id) {
        return ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with ID: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private boolean canUserModifyIdea(Idea idea, User user) {
        // Owner can modify
        if (idea.getIdeaOwner().getId().equals(user.getId())) {
            return true;
        }
        // Admin can modify
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
    }

    private boolean hasApprovalPermission(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN") || 
                                 role.getName().equals("ROLE_MANAGER") ||
                                 role.getName().equals("ROLE_REVIEWER"));
    }

    private String generateIdeaNumber() {
        String prefix = "IDEA";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = ideaRepository.count() + 1;
        return String.format("%s-%s-%05d", prefix, year, count);
    }

    private void calculateROI(Idea idea) {
        if (idea.getExpectedQuantitativeBenefitsValue() != null && 
            idea.getEstimatedEffortsValue() != null &&
            idea.getEstimatedEffortsValue().compareTo(BigDecimal.ZERO) > 0) {
            
            BigDecimal roi = idea.getExpectedQuantitativeBenefitsValue()
                    .subtract(idea.getEstimatedEffortsValue())
                    .divide(idea.getEstimatedEffortsValue(), 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            idea.setRoiPercentage(roi);
        }
    }

    private void createAuditLog(String action, String description, Long entityId) {
        User currentUser = getCurrentUser();
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType("IDEA");
        auditLog.setEntityId(entityId);
        auditLog.setNewValue(description);
        auditLog.setUser(currentUser);
        auditLog.setUsername(currentUser.getEmail());
        auditLog.setIpAddress(getClientIpAddress());
        auditLog.setUserAgent(getUserAgent());
        auditLogRepository.save(auditLog);
    }

    private String getClientIpAddress() {
        // This would be populated from HTTP request in controller
        return "127.0.0.1";
    }

    private String getUserAgent() {
        // This would be populated from HTTP request in controller
        return "CIMS-Application";
    }

    private void mapRequestToEntity(IdeaRequest request, Idea idea) {
        if (request.getIdeaNumber() != null) idea.setIdeaNumber(request.getIdeaNumber());
        if (request.getCategory() != null) idea.setCategory(request.getCategory());
        if (request.getIdentifiedBy() != null) idea.setIdentifiedBy(request.getIdentifiedBy());
        if (request.getIdentifiedOn() != null) idea.setIdentifiedOn(request.getIdentifiedOn());
        if (request.getPodTeam() != null) idea.setPodTeam(request.getPodTeam());
        if (request.getIbmDeliveryManager() != null) idea.setIbmDeliveryManager(request.getIbmDeliveryManager());
        if (request.getSuncorManager() != null) idea.setSuncorManager(request.getSuncorManager());
        if (request.getSuncorGm() != null) idea.setSuncorGm(request.getSuncorGm());
        if (request.getApplicationName() != null) idea.setApplicationName(request.getApplicationName());
        if (request.getConsultantName() != null) idea.setConsultantName(request.getConsultantName());
        if (request.getTitle() != null) idea.setTitle(request.getTitle());
        if (request.getProblemStatement() != null) idea.setProblemStatement(request.getProblemStatement());
        if (request.getProposedSolution() != null) idea.setProposedSolution(request.getProposedSolution());
        if (request.getActualSolutionImplemented() != null) idea.setActualSolutionImplemented(request.getActualSolutionImplemented());
        if (request.getSupportingPods() != null) idea.setSupportingPodsTeams(request.getSupportingPods());
        if (request.getServiceNowTicket() != null) idea.setServicenowTicket(request.getServiceNowTicket());
        if (request.getExpectedQuantitativeBenefitsHours() != null) idea.setExpectedQuantitativeBenefitsHours(BigDecimal.valueOf(request.getExpectedQuantitativeBenefitsHours()));
        if (request.getExpectedQuantitativeBenefitsValue() != null) idea.setExpectedQuantitativeBenefitsValue(request.getExpectedQuantitativeBenefitsValue());
        if (request.getExpectedQualitativeBenefits() != null) idea.setExpectedQualitativeBenefits(request.getExpectedQualitativeBenefits());
        if (request.getBenefitType() != null) idea.setBenefitType(request.getBenefitType().name());
        if (request.getEstimatedEffortsHours() != null) idea.setEstimatedEffortsHours(BigDecimal.valueOf(request.getEstimatedEffortsHours()));
        if (request.getEstimatedEffortsValue() != null) idea.setEstimatedEffortsValue(request.getEstimatedEffortsValue());
        if (request.getActualEffortsSpentHours() != null) idea.setActualEffortsSpentHours(BigDecimal.valueOf(request.getActualEffortsSpentHours()));
        if (request.getActualEffortsSpentValue() != null) idea.setActualEffortsSpentValue(request.getActualEffortsSpentValue());
        if (request.getImplementationDate() != null) idea.setImplementationDate(request.getImplementationDate());
        if (request.getSubStatus() != null) idea.setSubStatus(request.getSubStatus());
        if (request.getSuncorGoals() != null) idea.setSuncorGoals(request.getSuncorGoals());
        if (request.getRemarks() != null) idea.setRemarks(request.getRemarks());
        if (request.getPriority() != null) idea.setPriority(request.getPriority().name());
    }

    private IdeaResponse mapEntityToResponse(Idea idea) {
        return IdeaResponse.builder()
                .id(idea.getId())
                .ideaNumber(idea.getIdeaNumber())
                .category(idea.getCategory())
                .identifiedBy(idea.getIdentifiedBy())
                .identifiedOn(idea.getIdentifiedOn())
                .podTeam(idea.getPodTeam())
                .ibmDeliveryManager(idea.getIbmDeliveryManager())
                .suncorManager(idea.getSuncorManager())
                .suncorGm(idea.getSuncorGm())
                .applicationName(idea.getApplicationName())
                .consultantName(idea.getConsultantName())
                .title(idea.getTitle())
                .problemStatement(idea.getProblemStatement())
                .proposedSolution(idea.getProposedSolution())
                .actualSolutionImplemented(idea.getActualSolutionImplemented())
                .supportingPods(idea.getSupportingPodsTeams())
                .serviceNowTicket(idea.getServicenowTicket())
                .expectedQuantitativeBenefitsHours(idea.getExpectedQuantitativeBenefitsHours() != null ? idea.getExpectedQuantitativeBenefitsHours().intValue() : null)
                .expectedQuantitativeBenefitsValue(idea.getExpectedQuantitativeBenefitsValue())
                .expectedQualitativeBenefits(idea.getExpectedQualitativeBenefits())
                .benefitType(idea.getBenefitType() != null ? BenefitType.valueOf(idea.getBenefitType()) : null)
                .estimatedEffortsHours(idea.getEstimatedEffortsHours() != null ? idea.getEstimatedEffortsHours().intValue() : null)
                .estimatedEffortsValue(idea.getEstimatedEffortsValue())
                .actualEffortsSpentHours(idea.getActualEffortsSpentHours() != null ? idea.getActualEffortsSpentHours().intValue() : null)
                .actualEffortsSpentValue(idea.getActualEffortsSpentValue())
                .implementationDate(idea.getImplementationDate())
                .status(java.util.Arrays.stream(IdeaStatus.values())
                        .filter(status -> status.getDisplayName().equals(idea.getStatus()))
                        .findFirst()
                        .orElse(null))
                .subStatus(idea.getSubStatus())
                .reasonForRejection(idea.getRejectionReason())
                .suncorGoals(idea.getSuncorGoals())
                .remarks(idea.getRemarks())
                .priority(idea.getPriority() != null
                        ? java.util.Arrays.stream(Priority.values())
                            .filter(priority -> priority.name().equals(idea.getPriority()))
                            .findFirst()
                            .orElse(null)
                        : null)
                .roi(idea.getRoiPercentage())
                .ideaOwnerName(idea.getIdeaOwner().getFirstName() + " " + idea.getIdeaOwner().getLastName())
                .reviewerName(idea.getReviewer() != null ?
                        idea.getReviewer().getFirstName() + " " + idea.getReviewer().getLastName() : null)
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .build();
    }
    
    /**
     * Send email notifications to reviewers when idea is submitted
     */
    private void sendEmailToReviewers(Idea idea) {
        // Get all users with reviewer/manager/admin roles
        List<User> reviewers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("ROLE_ADMIN") ||
                                         role.getName().equals("ROLE_MANAGER") ||
                                         role.getName().equals("ROLE_REVIEWER")))
                .collect(Collectors.toList());
        
        // Send email to each reviewer
        for (User reviewer : reviewers) {
            emailService.sendApprovalRequiredEmail(idea, reviewer);
        }
        
        log.info("Sent approval required emails to {} reviewers", reviewers.size());
    }

    // Inner class for statistics
    @lombok.Data
    @lombok.Builder
    public static class IdeaStatistics {
        private long totalIdeas;
        private long approvedIdeas;
        private long rejectedIdeas;
        private long pendingIdeas;
        private BigDecimal totalBenefits;
        private BigDecimal totalROI;
    }
}

// Made with Bob
