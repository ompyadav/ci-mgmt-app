package com.cims.app.repository;

import com.cims.app.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    Page<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    long countByUser_IdAndIsReadFalse(Long userId);
    
    List<Notification> findByNotificationType(String notificationType);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :now")
    void deleteExpiredNotifications(@Param("now") LocalDateTime now);
    
    List<Notification> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}

// Made with Bob
