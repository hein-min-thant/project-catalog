package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SavedProjectResponseDTO {
    private Long projectId;
    private String projectTitle;
    private String projectDescription;
    private Long userId;
    private Long categoryId;
    private String coverImageUrl;
    private String academic_year;
    private String student_year;
    private LocalDateTime savedAt;
}