package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDTO {
    private Long id;
    private Long projectId;
    private Long userId;
    private String userName;  // Optional: for frontend convenience
    private String comment;
    private LocalDateTime createdAt;
}