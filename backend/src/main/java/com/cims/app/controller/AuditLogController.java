package com.cims.app.controller;

import com.cims.app.entity.AuditLog;
import com.cims.app.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Audit Logs and User Activity Reports
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    /**
     * Get all audit logs with pagination and filtering
     * GET /api/audit-logs
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('AUDIT_VIEW', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        log.info("GET /api/audit-logs - Fetching audit logs with filters");

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AuditLog> auditLogs;

        // Apply filters
        if (userId != null) {
            auditLogs = auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        } else if (startDate != null && endDate != null) {
            List<AuditLog> filteredLogs = auditLogRepository.findByDateRange(startDate, endDate);
            
            // Apply additional filters if provided
            if (action != null) {
                filteredLogs = filteredLogs.stream()
                        .filter(log -> action.equals(log.getAction()))
                        .toList();
            }
            if (module != null) {
                filteredLogs = filteredLogs.stream()
                        .filter(log -> module.equals(log.getModule()))
                        .toList();
            }
            if (entityType != null) {
                filteredLogs = filteredLogs.stream()
                        .filter(log -> entityType.equals(log.getEntityType()))
                        .toList();
            }
            
            // Convert to page
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredLogs.size());
            List<AuditLog> pageContent = filteredLogs.subList(start, end);
            auditLogs = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filteredLogs.size());
        } else {
            auditLogs = auditLogRepository.findAll(pageable);
        }

        return ResponseEntity.ok(auditLogs);
    }

    /**
     * Get user activity statistics
     * GET /api/audit-logs/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('AUDIT_VIEW', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getActivityStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("GET /api/audit-logs/statistics - Fetching activity statistics");

        Map<String, Object> statistics = new HashMap<>();

        // Set default date range if not provided (last 30 days)
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        List<AuditLog> logs = auditLogRepository.findByDateRange(startDate, endDate);

        // Total activities
        statistics.put("totalActivities", logs.size());

        // Activities by action type
        Map<String, Long> actionCounts = new HashMap<>();
        actionCounts.put("LOGIN", logs.stream().filter(l -> AuditLog.ACTION_LOGIN.equals(l.getAction())).count());
        actionCounts.put("CREATE", logs.stream().filter(l -> AuditLog.ACTION_CREATE.equals(l.getAction())).count());
        actionCounts.put("UPDATE", logs.stream().filter(l -> AuditLog.ACTION_UPDATE.equals(l.getAction())).count());
        actionCounts.put("DELETE", logs.stream().filter(l -> AuditLog.ACTION_DELETE.equals(l.getAction())).count());
        actionCounts.put("APPROVE", logs.stream().filter(l -> AuditLog.ACTION_APPROVE.equals(l.getAction())).count());
        actionCounts.put("REJECT", logs.stream().filter(l -> AuditLog.ACTION_REJECT.equals(l.getAction())).count());
        actionCounts.put("EXPORT", logs.stream().filter(l -> AuditLog.ACTION_EXPORT.equals(l.getAction())).count());
        statistics.put("actionCounts", actionCounts);

        // Activities by module
        Map<String, Long> moduleCounts = new HashMap<>();
        moduleCounts.put("USER", logs.stream().filter(l -> "USER".equals(l.getModule())).count());
        moduleCounts.put("IDEA", logs.stream().filter(l -> "IDEA".equals(l.getModule())).count());
        moduleCounts.put("ROLE", logs.stream().filter(l -> "ROLE".equals(l.getModule())).count());
        moduleCounts.put("NOTIFICATION", logs.stream().filter(l -> "NOTIFICATION".equals(l.getModule())).count());
        statistics.put("moduleCounts", moduleCounts);

        // Unique users count
        long uniqueUsers = logs.stream()
                .filter(l -> l.getUser() != null)
                .map(l -> l.getUser().getId())
                .distinct()
                .count();
        statistics.put("uniqueUsers", uniqueUsers);

        // Success vs failure rate
        long successCount = logs.stream().filter(l -> "SUCCESS".equals(l.getStatus())).count();
        long failureCount = logs.stream().filter(l -> "FAILURE".equals(l.getStatus())).count();
        statistics.put("successCount", successCount);
        statistics.put("failureCount", failureCount);
        statistics.put("successRate", logs.size() > 0 ? (double) successCount / logs.size() * 100 : 0);

        // Most active users (top 10)
        Map<String, Long> userActivityCounts = logs.stream()
                .filter(l -> l.getUsername() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        AuditLog::getUsername,
                        java.util.stream.Collectors.counting()
                ));
        
        List<Map<String, Object>> topUsers = userActivityCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> userStat = new HashMap<>();
                    userStat.put("username", entry.getKey());
                    userStat.put("activityCount", entry.getValue());
                    return userStat;
                })
                .toList();
        statistics.put("topUsers", topUsers);

        // Activity timeline (daily counts for the date range)
        Map<String, Long> dailyActivity = logs.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        l -> l.getTimestamp().toLocalDate().toString(),
                        java.util.stream.Collectors.counting()
                ));
        statistics.put("dailyActivity", dailyActivity);

        statistics.put("startDate", startDate);
        statistics.put("endDate", endDate);

        return ResponseEntity.ok(statistics);
    }

    /**
     * Get audit log by ID
     * GET /api/audit-logs/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('AUDIT_VIEW', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AuditLog> getAuditLogById(@PathVariable Long id) {
        log.info("GET /api/audit-logs/{} - Fetching audit log", id);
        
        return auditLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user's own activity logs
     * GET /api/audit-logs/my-activity
     */
    @GetMapping("/my-activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AuditLog>> getMyActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/audit-logs/my-activity - Fetching current user's activity");
        
        // Get current user ID from security context
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof com.cims.app.security.UserPrincipal) {
            com.cims.app.security.UserPrincipal userPrincipal = 
                (com.cims.app.security.UserPrincipal) authentication.getPrincipal();
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
            Page<AuditLog> myActivity = auditLogRepository.findByUserIdOrderByTimestampDesc(
                userPrincipal.getId(), pageable);
            
            return ResponseEntity.ok(myActivity);
        }
        
        return ResponseEntity.badRequest().build();
    }
}

// Made with Bob