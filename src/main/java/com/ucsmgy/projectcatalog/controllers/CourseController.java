package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.CourseDTO;
import com.ucsmgy.projectcatalog.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {
    
    private final CourseService courseService;
    
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
    
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO createdCourse = courseService.createCourse(courseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        CourseDTO updatedCourse = courseService.updateCourse(id, courseDTO);
        return ResponseEntity.ok(updatedCourse);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CourseDTO>> searchCourses(@RequestParam String searchTerm) {
        List<CourseDTO> courses = courseService.searchCourses(searchTerm);
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/department/{departmentId}/search")
    public ResponseEntity<List<CourseDTO>> searchCoursesByDepartment(
            @PathVariable Long departmentId, 
            @RequestParam String searchTerm) {
        List<CourseDTO> courses = courseService.searchCoursesByDepartment(departmentId, searchTerm);
        return ResponseEntity.ok(courses);
    }
}