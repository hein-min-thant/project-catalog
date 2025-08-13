package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Reaction;
import com.ucsmgy.projectcatalog.entities.SavedProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByProjectIdAndUserId(Long projectId, Long userId);
    long countByProjectId(Long projectId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}