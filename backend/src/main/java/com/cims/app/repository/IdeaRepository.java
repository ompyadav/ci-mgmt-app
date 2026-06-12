package com.cims.app.repository;

import com.cims.app.entity.Idea;
import com.cims.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Idea entity
 */
@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long>, JpaSpecificationExecutor<Idea> {

    /**
     * Find idea by idea number
     */
    Optional<Idea> findByIdeaNumber(String ideaNumber);

    /**
     * Check if idea number exists
     */
    boolean existsByIdeaNumber(String ideaNumber);

    /**
     * Find ideas by status
     */
    List<Idea> findByStatus(String status);

    /**
     * Find ideas by category
     */
    List<Idea> findByCategory(String category);

    /**
     * Find ideas by owner
     */
    List<Idea> findByIdeaOwner(User owner);

    /**
     * Find ideas by owner with pagination
     */
    Page<Idea> findByIdeaOwner(User owner, Pageable pageable);

    /**
     * Find ideas by owner ID with pagination
     */
    Page<Idea> findByIdeaOwnerId(Long ownerId, Pageable pageable);

    /**
     * Find ideas by reviewer
     */
    List<Idea> findByReviewer(User reviewer);

    /**
     * Find ideas by owner ID
     */
    List<Idea> findByIdeaOwnerId(Long ownerId);

    /**
     * Find ideas by reviewer ID
     */
    List<Idea> findByReviewerId(Long reviewerId);

    /**
     * Find ideas by status and owner
     */
    List<Idea> findByStatusAndIdeaOwnerId(String status, Long ownerId);

    /**
     * Find ideas by status and reviewer
     */
    List<Idea> findByStatusAndReviewerId(String status, Long reviewerId);

    /**
     * Find ideas by date range
     */
    @Query("SELECT i FROM Idea i WHERE i.submittedDate BETWEEN :startDate AND :endDate")
    List<Idea> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Find ideas by category and status
     */
    List<Idea> findByCategoryAndStatus(String category, String status);

    /**
     * Find archived ideas
     */
    List<Idea> findByIsArchivedTrue();

    /**
     * Find active ideas
     */
    List<Idea> findByIsArchivedFalse();

    /**
     * Search ideas by title or description
     */
    @Query("SELECT i FROM Idea i WHERE " +
           "LOWER(i.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.problemStatement) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.proposedSolution) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.ideaNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Idea> searchIdeas(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Count ideas by status
     */
    long countByStatus(String status);

    /**
     * Count ideas by category
     */
    long countByCategory(String category);

    /**
     * Count ideas by owner
     */
    long countByIdeaOwnerId(Long ownerId);

    /**
     * Count ideas by reviewer
     */
    long countByReviewerId(Long reviewerId);

    /**
     * Get total expected benefits
     */
    @Query("SELECT SUM(i.expectedQuantitativeBenefitsValue) FROM Idea i WHERE i.status = :status")
    BigDecimal getTotalExpectedBenefits(@Param("status") String status);

    /**
     * Get total actual benefits
     */
    @Query("SELECT SUM(i.actualQuantitativeBenefitsValue) FROM Idea i WHERE i.status = :status")
    BigDecimal getTotalActualBenefits(@Param("status") String status);

    /**
     * Get ideas by priority
     */
    List<Idea> findByPriority(String priority);

    /**
     * Get ideas by complexity
     */
    List<Idea> findByComplexity(String complexity);

    /**
     * Find ideas pending approval
     */
    @Query("SELECT i FROM Idea i WHERE i.status IN ('Under Review', 'Submitted') ORDER BY i.submittedDate ASC")
    List<Idea> findPendingApproval();

    /**
     * Find ideas by department (through owner)
     */
    @Query("SELECT i FROM Idea i JOIN i.ideaOwner u WHERE u.department = :department")
    List<Idea> findByDepartment(@Param("department") String department);

    /**
     * Get ideas statistics by status
     */
    @Query("SELECT i.status, COUNT(i) FROM Idea i GROUP BY i.status")
    List<Object[]> getIdeasCountByStatus();

    /**
     * Get ideas statistics by category
     */
    @Query("SELECT i.category, COUNT(i) FROM Idea i GROUP BY i.category")
    List<Object[]> getIdeasCountByCategory();

    /**
     * Find top ideas by ROI
     */
    @Query("SELECT i FROM Idea i WHERE i.roiPercentage IS NOT NULL ORDER BY i.roiPercentage DESC")
    Page<Idea> findTopIdeasByROI(Pageable pageable);

    /**
     * Find ideas implemented in date range
     */
    @Query("SELECT i FROM Idea i WHERE i.implementationDate BETWEEN :startDate AND :endDate")
    List<Idea> findImplementedInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

// Made with Bob
