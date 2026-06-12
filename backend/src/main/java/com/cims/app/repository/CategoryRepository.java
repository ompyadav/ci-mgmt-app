package com.cims.app.repository;

import com.cims.app.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Category> findByCategoryType(String categoryType);
    
    List<Category> findByCategoryTypeOrderByDisplayOrderAsc(String categoryType);
    
    List<Category> findByIsSystemCategoryTrue();
    
    List<Category> findByIsSystemCategoryFalse();
    
    List<Category> findByIsActiveTrue();
    
    List<Category> findByParentCategoryId(Long parentCategoryId);
    
    List<Category> findByParentCategoryIsNull();
}

// Made with Bob
