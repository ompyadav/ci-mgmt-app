package com.cims.app.service;

import com.cims.app.dto.CategoryRequest;
import com.cims.app.dto.CategoryResponse;
import com.cims.app.entity.Category;
import com.cims.app.entity.User;
import com.cims.app.exception.DuplicateResourceException;
import com.cims.app.exception.ResourceNotFoundException;
import com.cims.app.repository.CategoryRepository;
import com.cims.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing categories
 * Handles CRUD operations for categories
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * Create a new category
     */
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating new category: {}", request.getName());

        // Check if category already exists
        if (categoryRepository.findByName(request.getName())
                .filter(existing -> request.getType().equals(existing.getCategoryType()))
                .isPresent()) {
            throw new DuplicateResourceException("Category already exists: " + request.getName());
        }

        User currentUser = getCurrentUser();

        Category category = new Category();
        category.setName(request.getName());
        category.setCategoryType(request.getType());
        category.setDescription(request.getDescription());
        category.setIsActive(true);
        category.setCreatedBy(currentUser.getEmail());
        category.setUpdatedBy(currentUser.getEmail());

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());

        return mapToResponse(savedCategory);
    }

    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.info("Fetching category with ID: {}", id);
        Category category = findCategoryById(id);
        return mapToResponse(category);
    }

    /**
     * Get all categories
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active categories
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        log.info("Fetching active categories");
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get categories by type
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(String type) {
        log.info("Fetching categories with type: {}", type);
        return categoryRepository.findByCategoryType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active categories by type
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategoriesByType(String type) {
        log.info("Fetching active categories with type: {}", type);
        return categoryRepository.findByCategoryType(type).stream()
                .filter(category -> Boolean.TRUE.equals(category.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update category
     */
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        log.info("Updating category with ID: {}", id);

        Category category = findCategoryById(id);
        User currentUser = getCurrentUser();

        // Check if new name conflicts with existing category
        if (!category.getName().equals(request.getName()) &&
            categoryRepository.findByName(request.getName())
                .filter(existing -> request.getType().equals(existing.getCategoryType()))
                .isPresent()) {
            throw new DuplicateResourceException("Category already exists: " + request.getName());
        }

        category.setName(request.getName());
        category.setCategoryType(request.getType());
        category.setDescription(request.getDescription());
        category.setUpdatedBy(currentUser.getEmail());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", id);

        return mapToResponse(updatedCategory);
    }

    /**
     * Delete category
     */
    public void deleteCategory(Long id) {
        log.info("Deleting category with ID: {}", id);

        Category category = findCategoryById(id);
        categoryRepository.delete(category);

        log.info("Category deleted successfully: {}", id);
    }

    /**
     * Activate category
     */
    public CategoryResponse activateCategory(Long id) {
        log.info("Activating category with ID: {}", id);

        Category category = findCategoryById(id);
        User currentUser = getCurrentUser();

        category.setIsActive(true);
        category.setUpdatedBy(currentUser.getEmail());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category activated successfully: {}", id);

        return mapToResponse(updatedCategory);
    }

    /**
     * Deactivate category
     */
    public CategoryResponse deactivateCategory(Long id) {
        log.info("Deactivating category with ID: {}", id);

        Category category = findCategoryById(id);
        User currentUser = getCurrentUser();

        category.setIsActive(false);
        category.setUpdatedBy(currentUser.getEmail());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category deactivated successfully: {}", id);

        return mapToResponse(updatedCategory);
    }

    /**
     * Toggle category active status
     */
    public CategoryResponse toggleCategory(Long id) {
        log.info("Toggling category status with ID: {}", id);

        Category category = findCategoryById(id);
        User currentUser = getCurrentUser();

        category.setIsActive(!Boolean.TRUE.equals(category.getIsActive()));
        category.setUpdatedBy(currentUser.getEmail());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category status toggled successfully: {} - New status: {}", id, updatedCategory.getIsActive());

        return mapToResponse(updatedCategory);
    }

    /**
     * Search categories by name
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> searchCategories(String searchTerm) {
        log.info("Searching categories with term: {}", searchTerm);
        return categoryRepository.findAll().stream()
                .filter(category -> category.getName() != null &&
                        category.getName().toLowerCase().contains(searchTerm.toLowerCase()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getCategoryType())
                .description(category.getDescription())
                .active(Boolean.TRUE.equals(category.getIsActive()))
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .createdBy(category.getCreatedBy())
                .updatedBy(category.getUpdatedBy())
                .build();
    }
}

// Made with Bob
