package com.cims.app.controller;

import com.cims.app.entity.Notification;
import com.cims.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Notification Management
 * Provides endpoints for managing user notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for current user
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/notifications - Fetching notifications for current user");
        Page<Notification> notifications = notificationService.getMyNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for current user
     * GET /api/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<Page<Notification>> getUnreadNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/notifications/unread - Fetching unread notifications");
        Page<Notification> notifications = notificationService.getUnreadNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        log.info("GET /api/notifications/unread-count - Fetching unread count");
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(count);
    }

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        log.info("PUT /api/notifications/{}/read - Marking notification as read", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }

    /**
     * Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead() {
        log.info("PUT /api/notifications/read-all - Marking all notifications as read");
        notificationService.markAllAsRead();
        return ResponseEntity.ok("All notifications marked as read");
    }

    /**
     * Delete notification
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        log.info("DELETE /api/notifications/{} - Deleting notification", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Send system notification (admin only)
     * POST /api/notifications/system
     */
    @PostMapping("/system")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> sendSystemNotification(@RequestBody SystemNotificationRequest request) {
        log.info("POST /api/notifications/system - Sending system notification");
        notificationService.sendSystemNotification(request.getTitle(), request.getMessage());
        return ResponseEntity.ok("System notification sent successfully");
    }

    /**
     * DTO for system notification request
     */
    public static class SystemNotificationRequest {
        private String title;
        private String message;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}

// Made with Bob
