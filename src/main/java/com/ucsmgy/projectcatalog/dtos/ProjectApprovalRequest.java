package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

@Data
public class ProjectApprovalRequest {
    private String reason;
    private String action; // "approve" or "reject"
}
