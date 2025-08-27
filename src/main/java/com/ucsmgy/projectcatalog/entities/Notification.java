package com.ucsmgy.projectcatalog.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Setter
@Getter
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(nullable = false)
    private String message;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "notification_type", nullable = false)
    @JsonProperty("notificationType")
    private String notificationType = "COMMENT";

    @Column(name = "project_title")
    private String projectTitle;

    @Column(name = "comment_text")
    private String commentText;

    @Column(name = "commenter_name")
    private String commenterName;

    @Column(name = "approver_name")
    private String approverName;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "is_read", nullable = false)
    @JsonProperty("isRead")
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}