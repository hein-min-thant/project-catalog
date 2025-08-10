package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.ReactionResponseDTO;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.Reaction;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.repositories.ProjectReactionRepository;
import com.ucsmgy.projectcatalog.repositories.ProjectRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ProjectReactionRepository reactionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReactionResponseDTO toggleReaction(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByProjectIdAndUserId(projectId, userId);

        if (existingReaction.isPresent()) {
            // User already reacted, so remove reaction (unreact)
            reactionRepository.delete(existingReaction.get());
        } else {
            // Add new reaction
            Reaction reaction = new Reaction();
            reaction.setProject(project);
            reaction.setUser(user);
            reactionRepository.save(reaction);
        }

        long totalReactions = reactionRepository.countByProjectId(projectId);
        boolean reacted = reactionRepository.findByProjectIdAndUserId(projectId, userId).isPresent();

        return ReactionResponseDTO.builder()
                .projectId(projectId)
                .userId(userId)
                .reacted(reacted)
                .totalReactions(totalReactions)
                .build();
    }

    public boolean hasUserReacted(Long projectId, Long userId) {
        return reactionRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
    }

    public Long getTotalReactions(Long projectId) {
        return reactionRepository.countByProjectId(projectId);
    }
}
