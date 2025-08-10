package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.SavedProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedProjectRepository extends JpaRepository<SavedProject, Long> {
    Optional<SavedProject> findByProjectIdAndUserId(Long projectId, Long userId);
    List<SavedProject> findAllByUserId(Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
