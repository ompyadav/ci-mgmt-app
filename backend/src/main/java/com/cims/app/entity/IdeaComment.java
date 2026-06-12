package com.cims.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * IdeaComment Entity for storing comments and discussions on ideas
 */
@Entity
@Table(name = "idea_comments", indexes = {
    @Index(name = "idx_comment_idea", columnList = "idea_id"),
    @Index(name = "idx_comment_user", columnList = "user_id"),
    @Index(name = "idx_comment_parent", columnList = "parent_comment_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false)
    private Idea idea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Comment text is required")
    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private IdeaComment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IdeaComment> replies = new ArrayList<>();

    @Column(name = "is_edited")
    @Builder.Default
    private Boolean isEdited = false;

    @Column(name = "mentioned_users", length = 500)
    private String mentionedUsers; // Comma-separated user IDs

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "is_internal")
    @Builder.Default
    private Boolean isInternal = false; // For internal team comments

    @Column(name = "comment_type", length = 50)
    @Builder.Default
    private String commentType = "GENERAL"; // GENERAL, REVIEW, APPROVAL, REJECTION

    /**
     * Comment types
     */
    public static final String TYPE_GENERAL = "GENERAL";
    public static final String TYPE_REVIEW = "REVIEW";
    public static final String TYPE_APPROVAL = "APPROVAL";
    public static final String TYPE_REJECTION = "REJECTION";
    public static final String TYPE_QUESTION = "QUESTION";
    public static final String TYPE_ANSWER = "ANSWER";
}

// Made with Bob
