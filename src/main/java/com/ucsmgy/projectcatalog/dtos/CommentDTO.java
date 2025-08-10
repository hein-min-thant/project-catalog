package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long projectId;
    private Long userId;
    private String comment;
}