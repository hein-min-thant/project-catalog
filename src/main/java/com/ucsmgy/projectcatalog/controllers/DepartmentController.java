package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.DepartmentDTO;
import com.ucsmgy.projectcatalog.dtos.CourseDTO;
import com.ucsmgy.projectcatalog.services.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    @GetMapping
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }
    
    @PostMapping
    public ResponseEntity<DepartmentDTO> createDepartment(@RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO createdDepartment = departmentService.createDepartment(departmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDTO> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO updatedDepartment = departmentService.updateDepartment(id, departmentDTO);
        return ResponseEntity.ok(updatedDepartment);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<DepartmentDTO>> searchDepartments(@RequestParam String searchTerm) {
        List<DepartmentDTO> departments = departmentService.searchDepartments(searchTerm);
        return ResponseEntity.ok(departments);
    }
    
    @GetMapping("/{id}/courses")
    public ResponseEntity<List<CourseDTO>> getCoursesByDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getCoursesByDepartment(id));
    }
}