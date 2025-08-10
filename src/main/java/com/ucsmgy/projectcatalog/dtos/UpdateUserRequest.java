package com.ucsmgy.projectcatalog.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
}
