package com.ucsmgy.projectcatalog.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.springframework.stereotype.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Indexed
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    @FullTextField
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @FullTextField
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT", name = "benefits")
    @FullTextField
    private String benefits;

    // Rich text content fields
    @Column(columnDefinition = "TEXT")
    @FullTextField
    private String body;

    @Column(name = "content_format", length = 20)
    private String contentFormat = "html";

    @Column(name = "cover_image_url", length = 255)
    private String coverImageUrl;

    @Column(length = 500)
    private String excerpt;

    @Column(name = "academic_year")
    private String academic_year;

    @Column(name = "student_year")
    private String student_year;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "github_link", length = 255)
    private String githubLink;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectFile> files = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_tags",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    @Builder.Default
    private Set<Member> members = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SavedProject> savedByUsers = new ArrayList<>();

    // Enums
    @Getter
    public enum Status {
        IN_PROGRESS("in progress"),
        COMPLETED("completed");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public static Status fromValue(String value) {
            for (Status status : Status.values()) {
                if (status.value.equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown status: " + value);
        }
    }

    @Getter
    public enum ApprovalStatus {
        PENDING("pending"),
        APPROVED("approved"),
        REJECTED("rejected");

        private final String value;

        ApprovalStatus(String value) {
            this.value = value;
        }

        public static ApprovalStatus fromValue(String value) {
            for (ApprovalStatus status : ApprovalStatus.values()) {
                if (status.value.equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown approval status: " + value);
        }
    }



    // Lifecycle hooks
    @PrePersist
    @PreUpdate
    private void prePersist() {
        generateExcerpt();
        sanitizeContent();
    }

    private void generateExcerpt() {
        if (this.body != null) {
            String plainText = this.body
                    .replaceAll("<[^>]*>", "")  // Strip HTML tags
                    .replaceAll("\\s+", " ")    // Collapse whitespace
                    .trim();

            this.excerpt = plainText.substring(0, Math.min(plainText.length(), 500));
        } else {
            this.excerpt = null;
        }
    }

    private void sanitizeContent() {
        if (this.body != null && "html".equals(this.contentFormat)) {
            // Basic sanitization - should be complemented with a proper sanitizer
            this.body = this.body
                    .replaceAll("<script.*?>.*?</script>", "")  // Remove scripts
                    .replaceAll("javascript:", "");             // Remove JS protocols
        }
    }

    // Helper methods
    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getProjects().add(this);
    }

    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getProjects().remove(this);
    }

    public void addFile(ProjectFile file) {
        this.files.add(file);
        file.setProject(this);
    }

    // Equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Project project)) return false;
        return Objects.equals(id, project.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}