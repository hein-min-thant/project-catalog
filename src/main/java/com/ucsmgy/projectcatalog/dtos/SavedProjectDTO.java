package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SavedProjectDTO {
    private Long projectId;
    private Long userId;
}