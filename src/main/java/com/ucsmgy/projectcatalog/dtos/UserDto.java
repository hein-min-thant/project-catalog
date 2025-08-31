package com.ucsmgy.projectcatalog.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("is_active")
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}