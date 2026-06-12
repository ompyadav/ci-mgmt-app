package com.cims.app.service;

import com.cims.app.entity.Idea;
import com.cims.app.entity.Notification;
import com.cims.app.entity.NotificationType;
import com.cims.app.entity.User;
import com.cims.app.exception.ResourceNotFoundException;
import com.cims.app.repository.NotificationRepository;
import com.cims.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for managing notifications
 * Handles notification creation, retrieval, and status updates
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Create a notification for a specific user
     */
    public Notification createNotification(User recipient, String title, String message, NotificationType type) {
        log.info("Creating notification for user: {}", recipient.getEmail());

        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type.name());
        notification.setIsRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", savedNotification.getId());

        return savedNotification;
    }

    /**
     * Create notifications for multiple users
     */
    public void createNotifications(List<User> recipients, String title, String message, NotificationType type) {
        log.info("Creating notifications for {} users", recipients.size());

        recipients.forEach(recipient -> {
            createNotification(recipient, title, message, type);
        });
    }

    /**
     * Get all notifications for current user
     */
    @Transactional(readOnly = true)
    public Page<Notification> getMyNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("Fetching notifications for user: {}", currentUser.getEmail());
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(currentUser.getId(), pageable);
    }

    /**
     * Get unread notifications for current user
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("Fetching unread notifications for user: {}", currentUser.getEmail());
        Page<Notification> notificationsPage = notificationRepository.findByUser_IdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        List<Notification> filtered = notificationsPage.getContent().stream()
                .filter(notification -> !Boolean.TRUE.equals(notification.getIsRead()))
                .toList();
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
    }

    /**
     * Get unread notification count for current user
     */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = getCurrentUser();
        long count = notificationRepository.countByUser_IdAndIsReadFalse(currentUser.getId());
        log.info("Unread notification count for user {}: {}", currentUser.getEmail(), count);
        return count;
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        log.info("Marking notification as read: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        User currentUser = getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification marked as read: {}", notificationId);
    }

    /**
     * Mark all notifications as read for current user
     */
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        log.info("Marking all notifications as read for user: {}", currentUser.getEmail());

        List<Notification> unreadNotifications = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId());
        LocalDateTime now = LocalDateTime.now();

        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(now);
        });

        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read", unreadNotifications.size());
    }

    /**
     * Delete notification
     */
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        User currentUser = getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notificationRepository.delete(notification);
        log.info("Notification deleted: {}", notificationId);
    }

    /**
     * Delete old read notifications (cleanup)
     */
    public void deleteOldReadNotifications(int daysOld) {
        log.info("Deleting read notifications older than {} days", daysOld);
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.findAll().stream()
                .filter(notification -> Boolean.TRUE.equals(notification.getIsRead()))
                .filter(notification -> notification.getReadAt() != null && notification.getReadAt().isBefore(cutoffDate))
                .forEach(notificationRepository::delete);
    }

    // Notification creation helpers for specific events

    /**
     * Notify reviewers when an idea is submitted
     */
    public void notifyReviewers(Idea idea) {
        log.info("Notifying reviewers about new idea: {}", idea.getTitle());

        List<User> reviewers = userRepository.findByRoleName("ROLE_REVIEWER");
        List<User> managers = userRepository.findByRoleName("ROLE_MANAGER");
        List<User> admins = userRepository.findByRoleName("ROLE_ADMIN");

        // Combine all potential reviewers
        reviewers.addAll(managers);
        reviewers.addAll(admins);

        String title = "New Idea Submitted for Review";
        String message = String.format("A new idea '%s' has been submitted by %s and requires your review.",
                idea.getTitle(),
                idea.getIdeaOwner().getFirstName() + " " + idea.getIdeaOwner().getLastName());

        createNotifications(reviewers, title, message, NotificationType.IDEA_SUBMITTED);
    }

    /**
     * Notify idea owner about status changes
     */
    public void notifyIdeaOwner(Idea idea, String message) {
        log.info("Notifying idea owner: {}", idea.getIdeaOwner().getEmail());

        String title = "Idea Status Update: " + idea.getTitle();
        createNotification(idea.getIdeaOwner(), title, message, NotificationType.IDEA_STATUS_CHANGED);
    }

    /**
     * Notify user about comment on their idea
     */
    public void notifyIdeaComment(Idea idea, User commenter, String comment) {
        log.info("Notifying about new comment on idea: {}", idea.getTitle());

        if (!idea.getIdeaOwner().getId().equals(commenter.getId())) {
            String title = "New Comment on Your Idea";
            String message = String.format("%s commented on your idea '%s': %s",
                    commenter.getFirstName() + " " + commenter.getLastName(),
                    idea.getTitle(),
                    comment.length() > 100 ? comment.substring(0, 100) + "..." : comment);

            createNotification(idea.getIdeaOwner(), title, message, NotificationType.COMMENT_ADDED);
        }
    }

    /**
     * Notify about idea approval
     */
    public void notifyIdeaApproval(Idea idea) {
        String title = "Idea Approved";
        String message = String.format("Congratulations! Your idea '%s' has been approved.", idea.getTitle());
        createNotification(idea.getIdeaOwner(), title, message, NotificationType.IDEA_APPROVED);
    }

    /**
     * Notify about idea rejection
     */
    public void notifyIdeaRejection(Idea idea, String reason) {
        String title = "Idea Rejected";
        String message = String.format("Your idea '%s' has been rejected. Reason: %s", idea.getTitle(), reason);
        createNotification(idea.getIdeaOwner(), title, message, NotificationType.IDEA_REJECTED);
    }

    /**
     * Notify about idea implementation
     */
    public void notifyIdeaImplementation(Idea idea) {
        String title = "Idea Implementation Started";
        String message = String.format("Implementation has started for your idea '%s'.", idea.getTitle());
        createNotification(idea.getIdeaOwner(), title, message, NotificationType.IDEA_STATUS_CHANGED);
    }

    /**
     * Send system notification to all users
     */
    public void sendSystemNotification(String title, String message) {
        log.info("Sending system notification to all users");
        List<User> allUsers = userRepository.findByStatus(User.UserStatus.ACTIVE);
        createNotifications(allUsers, title, message, NotificationType.SYSTEM);
    }

    /**
     * Send notification to specific user by email
     */
    public void sendNotificationToUser(String userEmail, String title, String message, NotificationType type) {
        log.info("Sending notification to user: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        createNotification(user, title, message, type);
    }

    // Helper methods

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}

// Made with Bob
