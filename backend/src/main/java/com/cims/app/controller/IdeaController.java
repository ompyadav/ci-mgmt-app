package com.cims.app.controller;

import com.cims.app.dto.IdeaRequest;
import com.cims.app.dto.IdeaResponse;
import com.cims.app.entity.IdeaStatus;
import com.cims.app.service.IdeaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Idea Management
 * Provides endpoints for CRUD operations and workflow management of CI ideas
 */
@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Slf4j
public class IdeaController {

    private final IdeaService ideaService;
    private final com.cims.app.service.IdeaBulkImportService bulkImportService;

    /**
     * Get all ideas with pagination and optional filters
     * GET /api/ideas?status={status}&priority={priority}&search={search}
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getAllIdeas(
            @RequestParam(required = false) IdeaStatus status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas - Fetching ideas with filters: status={}, priority={}, search={}", status, priority, search);
        Page<IdeaResponse> ideas = ideaService.getAllIdeasWithFilters(status, priority, search, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get idea by ID
     * GET /api/ideas/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> getIdeaById(@PathVariable Long id) {
        log.info("GET /api/ideas/{} - Fetching idea by ID", id);
        IdeaResponse idea = ideaService.getIdeaById(id);
        return ResponseEntity.ok(idea);
    }

    /**
     * Get my ideas (current user)
     * GET /api/ideas/my-ideas
     */
    @GetMapping("/my-ideas")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER')")
    public ResponseEntity<Page<IdeaResponse>> getMyIdeas(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/my-ideas - Fetching current user's ideas");
        Page<IdeaResponse> ideas = ideaService.getMyIdeas(pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Create new idea
     * POST /api/ideas
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('IDEA_CREATE', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> createIdea(@Valid @RequestBody IdeaRequest request) {
        log.info("POST /api/ideas - Creating new idea: {}", request.getTitle());
        IdeaResponse idea = ideaService.createIdea(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(idea);
    }

    /**
     * Update idea
     * PUT /api/ideas/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('IDEA_UPDATE', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> updateIdea(
            @PathVariable Long id,
            @Valid @RequestBody IdeaRequest request) {
        log.info("PUT /api/ideas/{} - Updating idea", id);
        IdeaResponse idea = ideaService.updateIdea(id, request);
        return ResponseEntity.ok(idea);
    }

    /**
     * Delete idea
     * DELETE /api/ideas/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('IDEA_DELETE', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteIdea(@PathVariable Long id) {
        log.info("DELETE /api/ideas/{} - Deleting idea", id);
        ideaService.deleteIdea(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Submit idea for review
     * POST /api/ideas/{id}/submit
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('IDEA_UPDATE', 'ROLE_USER')")
    public ResponseEntity<IdeaResponse> submitIdea(@PathVariable Long id) {
        log.info("POST /api/ideas/{}/submit - Submitting idea for review", id);
        IdeaResponse idea = ideaService.submitIdea(id);
        return ResponseEntity.ok(idea);
    }

    /**
     * Approve idea
     * POST /api/ideas/{id}/approve
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('IDEA_APPROVE', 'ROLE_MANAGER', 'ROLE_REVIEWER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> approveIdea(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("POST /api/ideas/{}/approve - Approving idea", id);
        String comments = body != null ? body.get("comments") : "";
        IdeaResponse idea = ideaService.approveIdea(id, comments);
        return ResponseEntity.ok(idea);
    }

    /**
     * Reject idea
     * POST /api/ideas/{id}/reject
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('IDEA_REJECT', 'ROLE_MANAGER', 'ROLE_REVIEWER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> rejectIdea(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        log.info("POST /api/ideas/{}/reject - Rejecting idea", id);
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        IdeaResponse idea = ideaService.rejectIdea(id, reason);
        return ResponseEntity.ok(idea);
    }

    /**
     * Mark idea as implemented
     * POST /api/ideas/{id}/implement
     */
    @PostMapping("/{id}/implement")
    @PreAuthorize("hasAnyAuthority('IDEA_UPDATE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> markAsImplemented(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("POST /api/ideas/{}/implement - Marking idea as implemented", id);
        String actualSolutionImplemented = body != null ? body.get("actualSolutionImplemented") : "";
        String comments = body != null ? body.get("comments") : "";
        IdeaResponse idea = ideaService.markAsImplemented(id, actualSolutionImplemented, comments);
        return ResponseEntity.ok(idea);
    }

    /**
     * Move rejected idea back to draft
     * POST /api/ideas/{id}/revert-to-draft
     */
    @PostMapping("/{id}/revert-to-draft")
    @PreAuthorize("hasAnyAuthority('IDEA_UPDATE', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaResponse> revertToDraft(@PathVariable Long id) {
        log.info("POST /api/ideas/{}/revert-to-draft - Reverting rejected idea to draft", id);
        IdeaResponse idea = ideaService.revertToDraft(id);
        return ResponseEntity.ok(idea);
    }

    /**
     * Get ideas by status
     * GET /api/ideas/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getIdeasByStatus(
            @PathVariable IdeaStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/status/{} - Fetching ideas by status", status);
        Page<IdeaResponse> ideas = ideaService.getIdeasByStatus(status, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get ideas by category
     * GET /api/ideas/category/{category}
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getIdeasByCategory(
            @PathVariable String category,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/category/{} - Fetching ideas by category", category);
        Page<IdeaResponse> ideas = ideaService.getIdeasByCategory(category, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Search ideas
     * GET /api/ideas/search?q={searchTerm}
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> searchIdeas(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/search?q={} - Searching ideas", q);
        Page<IdeaResponse> ideas = ideaService.searchIdeas(q, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get ideas by date range
     * GET /api/ideas/date-range?startDate={startDate}&endDate={endDate}
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<IdeaResponse>> getIdeasByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("GET /api/ideas/date-range?startDate={}&endDate={} - Fetching ideas by date range", startDate, endDate);
        List<IdeaResponse> ideas = ideaService.getIdeasByDateRange(startDate, endDate);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get idea statistics
     * GET /api/ideas/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_MANAGER', 'ROLE_EXECUTIVE', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaService.IdeaStatistics> getStatistics() {
        log.info("GET /api/ideas/statistics - Fetching idea statistics");
        IdeaService.IdeaStatistics statistics = ideaService.getStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get pending approvals (for reviewers)
     * GET /api/ideas/pending-approvals
     */
    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyAuthority('IDEA_APPROVE', 'ROLE_MANAGER', 'ROLE_REVIEWER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getPendingApprovals(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        log.info("GET /api/ideas/pending-approvals - Fetching pending approvals");
        Page<IdeaResponse> ideas = ideaService.getIdeasByStatus(IdeaStatus.SUBMITTED, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get approved ideas
     * GET /api/ideas/approved
     */
    @GetMapping("/approved")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getApprovedIdeas(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/approved - Fetching approved ideas");
        Page<IdeaResponse> ideas = ideaService.getIdeasByStatus(IdeaStatus.APPROVED, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get rejected ideas
     * GET /api/ideas/rejected
     */
    @GetMapping("/rejected")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getRejectedIdeas(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/rejected - Fetching rejected ideas");
        Page<IdeaResponse> ideas = ideaService.getIdeasByStatus(IdeaStatus.REJECTED, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Get implemented ideas
     * GET /api/ideas/implemented
     */
    @GetMapping("/implemented")
    @PreAuthorize("hasAnyAuthority('IDEA_READ', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Page<IdeaResponse>> getImplementedIdeas(
            @PageableDefault(size = 20, sort = "implementationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/ideas/implemented - Fetching implemented ideas");
        Page<IdeaResponse> ideas = ideaService.getIdeasByStatus(IdeaStatus.IMPLEMENTED, pageable);
        return ResponseEntity.ok(ideas);
    }

    /**
     * Bulk import ideas from Excel file
     * POST /api/ideas/bulk-import
     */
    @PostMapping("/bulk-import")
    @PreAuthorize("hasAnyAuthority('IDEA_CREATE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkImportIdeas(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("POST /api/ideas/bulk-import - Bulk importing ideas from file: {}", file.getOriginalFilename());
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only Excel files (.xlsx, .xls) are supported"));
            }
            
            // Import ideas
            com.cims.app.service.IdeaBulkImportService.BulkImportResult result =
                    bulkImportService.importIdeasFromExcel(file);
            
            Map<String, Object> response = Map.of(
                    "success", true,
                    "successCount", result.getSuccessCount(),
                    "failureCount", result.getFailureCount(),
                    "errors", result.getErrors()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during bulk import: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to import ideas: " + e.getMessage()));
        }
    }

    /**
     * Delete all bulk uploaded ideas
     * DELETE /api/ideas/bulk-delete
     * WARNING: This will delete ALL ideas from the database
     */
    @DeleteMapping("/bulk-delete")
    @PreAuthorize("hasAnyAuthority('IDEA_DELETE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteBulkUploadedIdeas() {
        log.warn("DELETE /api/ideas/bulk-delete - Deleting all bulk uploaded ideas");
        
        try {
            com.cims.app.service.IdeaBulkImportService.BulkDeleteResult result =
                    bulkImportService.deleteAllBulkUploadedIdeas();
            
            if (result.isSuccess()) {
                Map<String, Object> response = Map.of(
                        "success", true,
                        "message", "Successfully deleted all bulk uploaded ideas",
                        "totalCount", result.getTotalCount(),
                        "deletedCount", result.getDeletedCount()
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "error", result.getErrorMessage()
                        ));
            }
            
        } catch (Exception e) {
            log.error("Error during bulk delete: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete bulk uploaded ideas: " + e.getMessage()));
        }
    }
}

// Made with Bob
