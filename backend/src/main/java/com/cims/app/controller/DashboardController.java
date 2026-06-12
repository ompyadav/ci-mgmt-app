package com.cims.app.controller;

import com.cims.app.entity.IdeaStatus;
import com.cims.app.service.IdeaService;
import com.cims.app.service.NotificationService;
import com.cims.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Dashboard
 * Provides endpoints for dashboard statistics and KPIs
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final IdeaService ideaService;
    private final UserService userService;
    private final NotificationService notificationService;

    /**
     * Get user dashboard
     * GET /api/dashboard/user
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW', 'ROLE_USER')")
    public ResponseEntity<Map<String, Object>> getUserDashboard() {
        log.info("GET /api/dashboard/user - Fetching user dashboard");

        Map<String, Object> dashboard = new HashMap<>();

        // My ideas count
        long myIdeasCount = ideaService.getMyIdeas(Pageable.unpaged()).getTotalElements();
        dashboard.put("myIdeasCount", myIdeasCount);

        // My approved ideas
        long myApprovedIdeas = ideaService.getMyIdeas(Pageable.unpaged())
                .stream()
                .filter(idea -> idea.getStatus() == IdeaStatus.APPROVED)
                .count();
        dashboard.put("myApprovedIdeas", myApprovedIdeas);

        // My pending ideas
        long myPendingIdeas = ideaService.getMyIdeas(Pageable.unpaged())
                .stream()
                .filter(idea -> idea.getStatus() == IdeaStatus.SUBMITTED || idea.getStatus() == IdeaStatus.UNDER_REVIEW)
                .count();
        dashboard.put("myPendingIdeas", myPendingIdeas);

        // My rejected ideas
        long myRejectedIdeas = ideaService.getMyIdeas(Pageable.unpaged())
                .stream()
                .filter(idea -> idea.getStatus() == IdeaStatus.REJECTED)
                .count();
        dashboard.put("myRejectedIdeas", myRejectedIdeas);

        // Unread notifications
        long unreadNotifications = notificationService.getUnreadCount();
        dashboard.put("unreadNotifications", unreadNotifications);

        // Recent ideas
        dashboard.put("recentIdeas", ideaService.getMyIdeas(Pageable.ofSize(5)).getContent());

        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get manager dashboard
     * GET /api/dashboard/manager
     */
    @GetMapping("/manager")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW', 'ROLE_MANAGER', 'ROLE_REVIEWER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getManagerDashboard() {
        log.info("GET /api/dashboard/manager - Fetching manager dashboard");

        Map<String, Object> dashboard = new HashMap<>();

        // Get idea statistics
        IdeaService.IdeaStatistics statistics = ideaService.getStatistics();

        // Pending approvals
        long pendingApprovals = statistics.getPendingIdeas();
        dashboard.put("pendingApprovals", pendingApprovals);

        // Total ideas
        dashboard.put("totalIdeas", statistics.getTotalIdeas());

        // Approved ideas
        dashboard.put("approvedIdeas", statistics.getApprovedIdeas());

        // Rejected ideas
        dashboard.put("rejectedIdeas", statistics.getRejectedIdeas());

        // Total benefits
        dashboard.put("totalBenefits", statistics.getTotalBenefits());

        // Total ROI
        dashboard.put("totalROI", statistics.getTotalROI());

        // Approval rate
        double approvalRate = statistics.getTotalIdeas() > 0 
            ? (double) statistics.getApprovedIdeas() / statistics.getTotalIdeas() * 100 
            : 0;
        dashboard.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);

        // Recent pending ideas
        dashboard.put("recentPendingIdeas", 
            ideaService.getIdeasByStatus(IdeaStatus.SUBMITTED, Pageable.ofSize(5)).getContent());

        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get executive dashboard
     * GET /api/dashboard/executive
     */
    @GetMapping("/executive")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_EXECUTIVE', 'ROLE_EXECUTIVE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getExecutiveDashboard() {
        log.info("GET /api/dashboard/executive - Fetching executive dashboard");

        Map<String, Object> dashboard = new HashMap<>();

        // Get idea statistics
        IdeaService.IdeaStatistics statistics = ideaService.getStatistics();

        // Organization summary
        Map<String, Object> organizationSummary = new HashMap<>();
        organizationSummary.put("totalIdeas", statistics.getTotalIdeas());
        organizationSummary.put("approvedIdeas", statistics.getApprovedIdeas());
        organizationSummary.put("rejectedIdeas", statistics.getRejectedIdeas());
        organizationSummary.put("pendingIdeas", statistics.getPendingIdeas());
        organizationSummary.put("implementedIdeas", 
            ideaService.getIdeasByStatus(IdeaStatus.IMPLEMENTED, Pageable.unpaged()).getTotalElements());
        dashboard.put("organizationSummary", organizationSummary);

        // Financial metrics
        Map<String, Object> financialMetrics = new HashMap<>();
        financialMetrics.put("totalBenefits", statistics.getTotalBenefits());
        financialMetrics.put("totalROI", statistics.getTotalROI());
        financialMetrics.put("averageROI", statistics.getTotalIdeas() > 0 
            ? statistics.getTotalROI().divide(BigDecimal.valueOf(statistics.getTotalIdeas()), 2, BigDecimal.ROUND_HALF_UP)
            : BigDecimal.ZERO);
        dashboard.put("financialMetrics", financialMetrics);

        // Performance metrics
        Map<String, Object> performanceMetrics = new HashMap<>();
        double approvalRate = statistics.getTotalIdeas() > 0 
            ? (double) statistics.getApprovedIdeas() / statistics.getTotalIdeas() * 100 
            : 0;
        performanceMetrics.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
        
        double implementationRate = statistics.getApprovedIdeas() > 0
            ? (double) ideaService.getIdeasByStatus(IdeaStatus.IMPLEMENTED, Pageable.unpaged()).getTotalElements() 
              / statistics.getApprovedIdeas() * 100
            : 0;
        performanceMetrics.put("implementationRate", Math.round(implementationRate * 100.0) / 100.0);
        dashboard.put("performanceMetrics", performanceMetrics);

        // User statistics
        Map<String, Object> userStats = new HashMap<>();
        userStats.put("totalUsers", userService.getAllUsers(Pageable.unpaged()).getTotalElements());
        userStats.put("activeUsers", userService.getActiveUsers().size());
        dashboard.put("userStatistics", userStats);

        // Top ideas by ROI
        dashboard.put("topIdeasByROI", 
            ideaService.getAllIdeas(Pageable.ofSize(5)).getContent());

        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get KPIs
     * GET /api/dashboard/kpis
     */
    @GetMapping("/kpis")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW', 'ROLE_MANAGER', 'ROLE_EXECUTIVE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        log.info("GET /api/dashboard/kpis - Fetching KPIs");

        Map<String, Object> kpis = new HashMap<>();

        // Get idea statistics
        IdeaService.IdeaStatistics statistics = ideaService.getStatistics();

        // Total ideas submitted
        kpis.put("totalIdeasSubmitted", statistics.getTotalIdeas());

        // Ideas approved
        kpis.put("ideasApproved", statistics.getApprovedIdeas());

        // Ideas rejected
        kpis.put("ideasRejected", statistics.getRejectedIdeas());

        // Ideas pending
        kpis.put("ideasPending", statistics.getPendingIdeas());

        // Ideas implemented
        kpis.put("ideasImplemented", 
            ideaService.getIdeasByStatus(IdeaStatus.IMPLEMENTED, Pageable.unpaged()).getTotalElements());

        // Total cost savings
        kpis.put("totalCostSavings", statistics.getTotalBenefits());

        // Total ROI
        kpis.put("totalROI", statistics.getTotalROI());

        // Average ROI per idea
        kpis.put("averageROI", statistics.getTotalIdeas() > 0 
            ? statistics.getTotalROI().divide(BigDecimal.valueOf(statistics.getTotalIdeas()), 2, BigDecimal.ROUND_HALF_UP)
            : BigDecimal.ZERO);

        // Approval rate
        double approvalRate = statistics.getTotalIdeas() > 0 
            ? (double) statistics.getApprovedIdeas() / statistics.getTotalIdeas() * 100 
            : 0;
        kpis.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);

        // Rejection rate
        double rejectionRate = statistics.getTotalIdeas() > 0 
            ? (double) statistics.getRejectedIdeas() / statistics.getTotalIdeas() * 100 
            : 0;
        kpis.put("rejectionRate", Math.round(rejectionRate * 100.0) / 100.0);

        // Implementation rate
        long implementedCount = ideaService.getIdeasByStatus(IdeaStatus.IMPLEMENTED, Pageable.unpaged()).getTotalElements();
        double implementationRate = statistics.getApprovedIdeas() > 0
            ? (double) implementedCount / statistics.getApprovedIdeas() * 100
            : 0;
        kpis.put("implementationRate", Math.round(implementationRate * 100.0) / 100.0);

        return ResponseEntity.ok(kpis);
    }

    /**
     * Get statistics summary
     * GET /api/dashboard/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW', 'ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<IdeaService.IdeaStatistics> getStatistics() {
        log.info("GET /api/dashboard/statistics - Fetching statistics");
        IdeaService.IdeaStatistics statistics = ideaService.getStatistics();
        return ResponseEntity.ok(statistics);
    }
}

// Made with Bob
