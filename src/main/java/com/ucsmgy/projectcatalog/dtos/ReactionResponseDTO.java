package com.ucsmgy.projectcatalog.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReactionResponseDTO {
    private Long projectId;
    private Long userId;
    private boolean reacted;  // true if user has reacted, false otherwise
    private Long totalReactions; // total reactions count for the project
}
