package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequestDTO {
    private String title;
    private String description;
    private String benefits;
    private String body;
    private String contentFormat;
    private String objectives;
    private String githubLink;
    private String coverImageUrl;
    private String academic_year;
    private String student_year;
    private Long categoryId;
    private String status;
    private List<MultipartFile> projectFiles;

    private List<String> tags;

}

