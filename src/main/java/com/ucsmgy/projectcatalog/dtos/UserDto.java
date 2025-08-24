package com.ucsmgy.projectcatalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}