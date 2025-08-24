package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.dtos.UserDto;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.services.ProjectService;
import com.ucsmgy.projectcatalog.services.UserRoleService;
import com.ucsmgy.projectcatalog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRoleService userRoleService;
    private final UserService userService;
    private final ProjectService projectService;

    // ===== USER ROLE MANAGEMENT =====
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> setUserRole(
            @PathVariable Long userId,
            @RequestParam String role,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify the current user is an admin
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        User updatedUser = userRoleService.setUserRole(userId, role);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/supervisor")
    public ResponseEntity<User> setUserAsSupervisor(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        User updatedUser = userRoleService.setUserAsSupervisor(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/admin")
    public ResponseEntity<User> setUserAsAdmin(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        User updatedUser = userRoleService.setUserAsAdmin(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/user")
    public ResponseEntity<User> setUserAsRegularUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        User updatedUser = userRoleService.setUserAsRegularUser(userId);
        return ResponseEntity.ok(updatedUser);
    }

    // ===== USER QUERIES =====
    
    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Page<UserDto> users = userService.getAllUsersPaginated(page, size);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/supervisors")
    public ResponseEntity<List<User>> getAllSupervisors(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> supervisors = userRoleService.getAllSupervisors();
        return ResponseEntity.ok(supervisors);
    }

    @GetMapping("/users/admins")
    public ResponseEntity<List<User>> getAllAdmins(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<User> admins = userRoleService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/users/regular-users")
    public ResponseEntity<List<User>> getAllRegularUsers(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<User> users = userRoleService.getAllRegularUsers();
        return ResponseEntity.ok(users);
    }

    // ===== PROJECT QUERIES =====
    
    @GetMapping("/projects")
    public ResponseEntity<Page<ProjectResponseDTO>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Page<ProjectResponseDTO> projects = projectService.getAll(page, size);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/pending")
    public ResponseEntity<List<ProjectResponseDTO>> getPendingProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ProjectResponseDTO> projects = projectService.getProjectsByApprovalStatus(com.ucsmgy.projectcatalog.entities.Project.ApprovalStatus.PENDING);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/rejected")
    public ResponseEntity<List<ProjectResponseDTO>> getRejectedProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ProjectResponseDTO> projects = projectService.getProjectsByApprovalStatus(com.ucsmgy.projectcatalog.entities.Project.ApprovalStatus.REJECTED);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/approved")
    public ResponseEntity<List<ProjectResponseDTO>> getApprovedProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmailEntity(userDetails.getUsername());
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ProjectResponseDTO> projects = projectService.getProjectsByApprovalStatus(com.ucsmgy.projectcatalog.entities.Project.ApprovalStatus.APPROVED);
        return ResponseEntity.ok(projects);
    }
}
