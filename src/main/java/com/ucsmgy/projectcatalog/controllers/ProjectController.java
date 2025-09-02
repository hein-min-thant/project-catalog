package com.ucsmgy.projectcatalog.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import com.ucsmgy.projectcatalog.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectResponseDTO> create(
            @ModelAttribute ProjectRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            UriComponentsBuilder uriBuilder) throws JsonProcessingException {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        Map<String, String> membersMap = new HashMap<>();
        if (dto.getMembersJson() != null && !dto.getMembersJson().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            membersMap = mapper.readValue(dto.getMembersJson(), new TypeReference<Map<String, String>>() {});
        }

        ProjectResponseDTO createdProject = projectService.create(dto, userId, membersMap);

        URI uri = uriBuilder
                .path("/projects/{id}")
                .buildAndExpand(createdProject.getId())
                .toUri();

        return ResponseEntity
                .created(uri)
                .body(createdProject);
    }

    @GetMapping("/user/{userId}/projects")
    public List<ProjectResponseDTO> getUserProjects(@PathVariable Long userId) {
        return projectService.getProjectsByUserId(userId);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectResponseDTO> update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @ModelAttribute ProjectRequestDTO dto) throws JsonProcessingException {

        Map<String, String> membersMap = new HashMap<>();
        if (dto.getMembersJson() != null && !dto.getMembersJson().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            membersMap = mapper.readValue(dto.getMembersJson(), new TypeReference<Map<String, String>>() {});
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        ProjectResponseDTO updatedProject = projectService.update(id,userId, dto , membersMap);
        return ResponseEntity.ok(updatedProject);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ProjectResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If user is admin, show all projects. Otherwise, only show approved projects
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(projectService.getAll(page, size));
        } else {
            return ResponseEntity.ok(projectService.getApprovedProjects(page, size));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProjectResponseDTO>> search(
            @RequestParam(required = false) Optional<String> keyword,
            @RequestParam(required = false) Optional<Long> departmentId,
            @RequestParam(required = false) Optional<Long> courseId,
            @RequestParam(required = false) Optional<String> tags,
            @RequestParam(required = false) Optional<String> academicYear,
            @RequestParam(required = false) Optional<String> studentYear,
            @RequestParam(required = false) Optional<String> name,
            @RequestParam(required = false) Optional<String> supervisor,
            @RequestParam(required = false) Optional<String> members,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If user is admin, search all projects. Otherwise, only search approved projects
        if ("ADMIN".equals(user.getRole())) {
            Page<ProjectResponseDTO> result = projectService.search(
                    keyword,
                    departmentId,
                    courseId,
                    tags,
                    academicYear,
                    studentYear,
                    name,
                    supervisor,
                    members,
                    page,
                    size,
                    sortBy,
                    sortDirection
            );
            return ResponseEntity.ok(result);
        } else {
            Page<ProjectResponseDTO> result = projectService.searchApprovedProjects(
                    keyword,
                    departmentId,
                    courseId,
                    tags,
                    academicYear,
                    studentYear,
                    name,
                    supervisor,
                    members,
                    page,
                    size,
                    sortBy,
                    sortDirection
            );
            return ResponseEntity.ok(result);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only admins can delete projects
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}