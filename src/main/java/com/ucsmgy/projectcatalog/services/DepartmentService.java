package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.DepartmentDTO;
import com.ucsmgy.projectcatalog.dtos.CourseDTO;
import com.ucsmgy.projectcatalog.entities.Department;
import com.ucsmgy.projectcatalog.entities.Course;
import com.ucsmgy.projectcatalog.mappers.DepartmentMapper;
import com.ucsmgy.projectcatalog.mappers.CourseMapper;
import com.ucsmgy.projectcatalog.repositories.DepartmentRepository;
import com.ucsmgy.projectcatalog.repositories.CourseRepository;
import com.ucsmgy.projectcatalog.exceptions.ResourceNotFoundException;
import com.ucsmgy.projectcatalog.exceptions.DuplicateResourceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final DepartmentMapper departmentMapper;
    private final CourseMapper courseMapper;
    
    public List<DepartmentDTO> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream()
                .map(departmentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return departmentMapper.toDTO(department);
    }
    
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.existsByName(departmentDTO.getName())) {
            throw new DuplicateResourceException("Department with name '" + departmentDTO.getName() + "' already exists");
        }
        
        Department department = departmentMapper.toEntity(departmentDTO);
        Department savedDepartment = departmentRepository.save(department);
        return departmentMapper.toDTO(savedDepartment);
    }
    
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        
        if (!existingDepartment.getName().equals(departmentDTO.getName()) && 
            departmentRepository.existsByName(departmentDTO.getName())) {
            throw new DuplicateResourceException("Department with name '" + departmentDTO.getName() + "' already exists");
        }
        
        existingDepartment.setName(departmentDTO.getName());
        
        Department updatedDepartment = departmentRepository.save(existingDepartment);
        return departmentMapper.toDTO(updatedDepartment);
    }
    
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        
        // Check if department has courses
        List<Course> courses = courseRepository.findByDepartmentId(id);
        if (!courses.isEmpty()) {
            throw new IllegalStateException("Cannot delete department with existing courses. Please delete all courses first.");
        }
        
        departmentRepository.deleteById(id);
    }
    
    public List<DepartmentDTO> searchDepartments(String searchTerm) {
        List<Department> departments = departmentRepository.searchDepartments(searchTerm);
        return departments.stream()
                .map(departmentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<CourseDTO> getCoursesByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        
        List<Course> courses = courseRepository.findByDepartmentId(departmentId);
        return courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());
    }
}