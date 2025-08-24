package com.ucsmgy.projectcatalog.entities;

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

    @Column(name = "comment_id", nullable = false)
    private Long commentId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}