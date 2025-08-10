package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.SavedProjectDTO;
import com.ucsmgy.projectcatalog.dtos.SavedProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.SavedProject;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.mappers.SavedProjectMapper;
import com.ucsmgy.projectcatalog.repositories.ProjectRepository;
import com.ucsmgy.projectcatalog.repositories.SavedProjectRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedProjectService {

    private final SavedProjectRepository savedProjectRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SavedProjectMapper savedProjectMapper;

    @Transactional
    public SavedProjectResponseDTO saveProject(SavedProjectDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<SavedProject> existing = savedProjectRepository.findByProjectIdAndUserId(dto.getProjectId(), dto.getUserId());
        if (existing.isPresent()) {
            throw new IllegalStateException("Project already saved by user");
        }

        SavedProject savedProject = savedProjectMapper.toEntity(dto);
        savedProject.setProject(project);
        savedProject.setUser(user);
        savedProject.setSavedAt(LocalDateTime.now());

        SavedProject saved = savedProjectRepository.save(savedProject);
        return savedProjectMapper.toDTO(saved);
    }

    public List<SavedProjectResponseDTO> getSavedProjectsByUser(Long userId) {
        List<SavedProject> savedProjects = savedProjectRepository.findAllByUserId(userId);
        return savedProjects.stream()
                .map(savedProjectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeSavedProject(Long projectId, Long userId) {
        savedProjectRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public boolean isProjectSavedByUser(Long projectId, Long userId) {
        return savedProjectRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
    }
}
