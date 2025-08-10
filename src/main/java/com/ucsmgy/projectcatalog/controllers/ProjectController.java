package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // --- Create a Project with File Upload ---
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectResponseDTO> create(
            @ModelAttribute ProjectRequestDTO dto,
            Principal principal,
            UriComponentsBuilder uriBuilder) {

        // In a real application, you would get the user's ID from the principal object
        // e.g., Long userId = myUserService.getUserId(principal.getName());
        Long userId = 1L; // For demonstration, use a placeholder

        ProjectResponseDTO createdProject = projectService.create(dto, userId);

        URI uri = uriBuilder
                .path("/projects/{id}")
                .buildAndExpand(createdProject.getId())
                .toUri();

        return ResponseEntity
                .created(uri)
                .body(createdProject);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectResponseDTO> update(
            @PathVariable Long id,
            @ModelAttribute ProjectRequestDTO dto) {

        ProjectResponseDTO updatedProject = projectService.update(id, dto);
        return ResponseEntity.ok(updatedProject);
    }

    // --- Existing endpoints remain largely the same ---

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ProjectResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(projectService.getAll(page, size));
    }

    // ----------------- NEW ENDPOINT -----------------
    // API for searching, sorting, and paging
    @GetMapping("/search")
    public ResponseEntity<Page<ProjectResponseDTO>> search(
            @RequestParam(required = false) Optional<String> keyword,
            @RequestParam(required = false) Optional<Long> categoryId,
            @RequestParam(required = false) Optional<String> status,
            @RequestParam(required = false) Optional<String> tags,
            @RequestParam(required = false) Optional<String> academicYear, // NEW
            @RequestParam(required = false) Optional<String> studentYear, // Comma-separated list of tag names
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Page<ProjectResponseDTO> result = projectService.search(
                keyword,
                categoryId,
                status,
                tags,
                academicYear, // NEW
                studentYear,
                page,
                size,
                sortBy,
                sortDirection
        );
        return ResponseEntity.ok(result);
    }
}