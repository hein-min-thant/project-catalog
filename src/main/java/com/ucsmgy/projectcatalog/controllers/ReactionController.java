package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.ReactionDTO;
import com.ucsmgy.projectcatalog.dtos.ReactionResponseDTO;
import com.ucsmgy.projectcatalog.services.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    // Toggle reaction: if reacted -> remove, if not reacted -> add
    @PostMapping("/toggle")
    public ResponseEntity<ReactionResponseDTO> toggleReaction(@RequestBody ReactionDTO dto) {
        ReactionResponseDTO response = reactionService.toggleReaction(dto.getProjectId(), dto.getUserId());
        return ResponseEntity.ok(response);
    }

    // Optional: get reaction status for a user on a project
    @GetMapping("/status")
    public ResponseEntity<ReactionResponseDTO> getReactionStatus(
            @RequestParam Long projectId,
            @RequestParam Long userId) {
        boolean reacted = reactionService.hasUserReacted(projectId, userId);
        Long totalReactions = reactionService.getTotalReactions(projectId);
        ReactionResponseDTO response = ReactionResponseDTO.builder()
                .projectId(projectId)
                .userId(userId)
                .reacted(reacted)
                .totalReactions(totalReactions)
                .build();
        return ResponseEntity.ok(response);
    }
}
