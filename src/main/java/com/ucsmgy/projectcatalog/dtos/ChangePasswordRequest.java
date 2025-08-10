package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
