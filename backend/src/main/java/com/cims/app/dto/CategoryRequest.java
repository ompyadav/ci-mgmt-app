package com.cims.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Category creation and update requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Category type is required")
    @Size(max = 50, message = "Category type must not exceed 50 characters")
    private String type;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}

// Made with Bob
