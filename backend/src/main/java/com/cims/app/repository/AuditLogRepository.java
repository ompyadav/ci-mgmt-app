package com.cims.app.repository;

import com.cims.app.entity.AuditLog;
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
 * Repository interface for AuditLog entity
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    
    Page<AuditLog> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    List<AuditLog> findByAction(String action);
    
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    
    List<AuditLog> findByModule(String module);
    
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a FROM AuditLog a WHERE a.action = :action AND a.timestamp BETWEEN :startDate AND :endDate")
    List<AuditLog> findByActionAndDateRange(@Param("action") String action, 
                                            @Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.timestamp < :cutoffDate")
    void deleteOldLogs(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    long countByAction(String action);
    
    long countByUserId(Long userId);
}

// Made with Bob
