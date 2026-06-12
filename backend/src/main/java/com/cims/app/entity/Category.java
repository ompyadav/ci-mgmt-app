package com.cims.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Category Entity for configurable idea categories
 */
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_category_name", columnList = "name"),
    @Index(name = "idx_category_type", columnList = "category_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "category_type", length = 50)
    private String categoryType; // IDEA_CATEGORY, DEPARTMENT, BUSINESS_UNIT, etc.

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "color_code", length = 20)
    private String colorCode;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "is_system_category")
    @Builder.Default
    private Boolean isSystemCategory = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    private Category parentCategory;

    /**
     * Category types
     */
    public static final String TYPE_IDEA_CATEGORY = "IDEA_CATEGORY";
    public static final String TYPE_DEPARTMENT = "DEPARTMENT";
    public static final String TYPE_BUSINESS_UNIT = "BUSINESS_UNIT";
    public static final String TYPE_LOCATION = "LOCATION";
    public static final String TYPE_STATUS = "STATUS";
    public static final String TYPE_SUB_STATUS = "SUB_STATUS";
    public static final String TYPE_BENEFIT_TYPE = "BENEFIT_TYPE";
    public static final String TYPE_PRIORITY = "PRIORITY";
    public static final String TYPE_COMPLEXITY = "COMPLEXITY";
}

// Made with Bob
