package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.ProjectApprovalRequest;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import com.ucsmgy.projectcatalog.services.ProjectService;
import com.ucsmgy.projectcatalog.services.UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final ProjectService projectService;
    private final UserRepository userRepository;


    @PostMapping("/projects/{projectId}/approve")
    public ResponseEntity<ProjectResponseDTO> approveProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User supervisor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProjectResponseDTO approvedProject = projectService.approveProject(projectId, supervisor.getId());
        return ResponseEntity.ok(approvedProject);
    }


    @PostMapping("/projects/{projectId}/reject")
    public ResponseEntity<ProjectResponseDTO> rejectProject(
            @PathVariable Long projectId,
            @RequestBody ProjectApprovalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User supervisor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProjectResponseDTO rejectedProject = projectService.rejectProject(projectId, supervisor.getId(), request.getReason());
        return ResponseEntity.ok(rejectedProject);
    }

    @PostMapping("/projects/{projectId}/approval")
    public ResponseEntity<ProjectResponseDTO> handleProjectApproval(
            @PathVariable Long projectId,
            @RequestBody ProjectApprovalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User supervisor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("approve".equalsIgnoreCase(request.getAction())) {
            ProjectResponseDTO approvedProject = projectService.approveProject(projectId, supervisor.getId());
            return ResponseEntity.ok(approvedProject);
        } else if ("reject".equalsIgnoreCase(request.getAction())) {
            ProjectResponseDTO rejectedProject = projectService.rejectProject(projectId, supervisor.getId(), request.getReason());
            return ResponseEntity.ok(rejectedProject);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/projects/pending")
    public ResponseEntity<List<ProjectResponseDTO>> getPendingProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User supervisor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"SUPERVISOR".equals(supervisor.getRole()) && !"ADMIN".equals(supervisor.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ProjectResponseDTO> pendingProjects = projectService.getProjectsPendingApproval(supervisor.getId());
        return ResponseEntity.ok(pendingProjects);
    }

    @GetMapping("/projects/status/{status}")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User supervisor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is a supervisor or admin
        if (!"SUPERVISOR".equals(supervisor.getRole()) && !"ADMIN".equals(supervisor.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Project.ApprovalStatus approvalStatus = Project.ApprovalStatus.fromValue(status);
        List<ProjectResponseDTO> projects = projectService.getProjectsByApprovalStatus(approvalStatus);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/without-supervisor")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsWithoutSupervisor(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        

        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ProjectResponseDTO> projects = projectService.getProjectsWithoutSupervisor();
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/projects/{projectId}/assign-supervisor/{supervisorId}")
    public ResponseEntity<ProjectResponseDTO> assignSupervisor(
            @PathVariable Long projectId,
            @PathVariable Long supervisorId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only admins can assign supervisors
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        ProjectResponseDTO updatedProject = projectService.assignSupervisor(projectId, supervisorId);
        return ResponseEntity.ok(updatedProject);
    }
}
