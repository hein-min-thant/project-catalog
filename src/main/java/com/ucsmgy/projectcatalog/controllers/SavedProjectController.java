package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.SavedProjectDTO;
import com.ucsmgy.projectcatalog.dtos.SavedProjectResponseDTO;
import com.ucsmgy.projectcatalog.services.SavedProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saved-projects")
@RequiredArgsConstructor
public class SavedProjectController {

    private final SavedProjectService savedProjectService;

    @PostMapping
    public ResponseEntity<SavedProjectResponseDTO> saveProject(@RequestBody SavedProjectDTO dto) {
        SavedProjectResponseDTO savedProject = savedProjectService.saveProject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedProjectResponseDTO>> getSavedProjects(@PathVariable Long userId) {
        List<SavedProjectResponseDTO> savedProjects = savedProjectService.getSavedProjectsByUser(userId);
        return ResponseEntity.ok(savedProjects);
    }

    @DeleteMapping
    public ResponseEntity<Void> removeSavedProject(@RequestParam Long projectId, @RequestParam Long userId) {
        savedProjectService.removeSavedProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkIfSaved(@RequestParam Long projectId, @RequestParam Long userId) {
        boolean isSaved = savedProjectService.isProjectSavedByUser(projectId, userId);
        return ResponseEntity.ok(isSaved);
    }
}

