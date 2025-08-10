package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String benefits;
    private String body;
    private String excerpt;
    private String contentFormat;
    private String githubLink;
    private String coverImageUrl;
    private String academic_year;
    private String student_year;
    private String objectives;
    private String status;
    private List<String> projectFiles;
    private List<String> tags;
}
