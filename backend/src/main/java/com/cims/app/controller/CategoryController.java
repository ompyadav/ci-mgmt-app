package com.cims.app.controller;

import com.cims.app.dto.CategoryRequest;
import com.cims.app.dto.CategoryResponse;
import com.cims.app.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Category Management
 * Provides endpoints for CRUD operations on categories
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Get all categories
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.info("GET /api/categories - Fetching all categories");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        log.info("GET /api/categories/{} - Fetching category by ID", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Get active categories
     * GET /api/categories/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        log.info("GET /api/categories/active - Fetching active categories");
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get categories by type
     * GET /api/categories/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CategoryResponse>> getCategoriesByType(@PathVariable String type) {
        log.info("GET /api/categories/type/{} - Fetching categories by type", type);
        List<CategoryResponse> categories = categoryService.getCategoriesByType(type);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get active categories by type
     * GET /api/categories/type/{type}/active
     */
    @GetMapping("/type/{type}/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategoriesByType(@PathVariable String type) {
        log.info("GET /api/categories/type/{}/active - Fetching active categories by type", type);
        List<CategoryResponse> categories = categoryService.getActiveCategoriesByType(type);
        return ResponseEntity.ok(categories);
    }

    /**
     * Create new category
     * POST /api/categories
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("POST /api/categories - Creating new category: {}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * Update category
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        log.info("PUT /api/categories/{} - Updating category", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }

    /**
     * Delete category
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.info("DELETE /api/categories/{} - Deleting category", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Activate category
     * POST /api/categories/{id}/activate
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<CategoryResponse> activateCategory(@PathVariable Long id) {
        log.info("POST /api/categories/{}/activate - Activating category", id);
        CategoryResponse category = categoryService.activateCategory(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Deactivate category
     * POST /api/categories/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<CategoryResponse> deactivateCategory(@PathVariable Long id) {
        log.info("POST /api/categories/{}/deactivate - Deactivating category", id);
        CategoryResponse category = categoryService.deactivateCategory(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Toggle category active status
     * PATCH /api/categories/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyAuthority('CONFIG_MANAGE', 'ROLE_ADMIN')")
    public ResponseEntity<CategoryResponse> toggleCategory(@PathVariable Long id) {
        log.info("PATCH /api/categories/{}/toggle - Toggling category status", id);
        CategoryResponse category = categoryService.toggleCategory(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Search categories
     * GET /api/categories/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponse>> searchCategories(@RequestParam String q) {
        log.info("GET /api/categories/search?q={} - Searching categories", q);
        List<CategoryResponse> categories = categoryService.searchCategories(q);
        return ResponseEntity.ok(categories);
    }
}

// Made with Bob
