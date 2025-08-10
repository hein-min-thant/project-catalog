package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SavedProjectResponseDTO {
    private Long id;
    private Long projectId;
    private String projectTitle; // optional, for convenience
    private Long userId;
    private LocalDateTime savedAt;
}