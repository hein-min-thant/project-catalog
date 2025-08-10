package com.ucsmgy.projectcatalog.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationRequest {
    @Email
    private String email;
    @NotBlank
    private String code;
}