package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReactionDTO {
    private Long projectId;
    private Long userId;
}