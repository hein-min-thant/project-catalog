package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private Long userId;
    private Long departmentId;
    private Long courseId;
    private Long supervisorId;
    private String supervisorName;
    private String approvalStatus;
    private LocalDateTime approvedAt;
    private Long approvedById;
    private String approvedByName;
    private List<String> projectFiles;
    private List<String> tags;
    private String membersJson;
}
