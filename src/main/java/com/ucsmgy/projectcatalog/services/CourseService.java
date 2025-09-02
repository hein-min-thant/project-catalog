package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.CourseDTO;
import com.ucsmgy.projectcatalog.entities.Course;
import com.ucsmgy.projectcatalog.entities.Department;
import com.ucsmgy.projectcatalog.mappers.CourseMapper;
import com.ucsmgy.projectcatalog.repositories.CourseRepository;
import com.ucsmgy.projectcatalog.repositories.DepartmentRepository;
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
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseMapper courseMapper;
    
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return courseMapper.toDTO(course);
    }
    
    public CourseDTO createCourse(CourseDTO courseDTO) {
        if (courseDTO.getCode() != null && courseRepository.existsByCode(courseDTO.getCode())) {
            throw new DuplicateResourceException("Course with code '" + courseDTO.getCode() + "' already exists");
        }
        
        Department department = departmentRepository.findById(courseDTO.getDepartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartment().getId()));
        
        if (courseRepository.existsByNameAndDepartmentId(courseDTO.getName(), department.getId())) {
            throw new DuplicateResourceException("Course with name '" + courseDTO.getName() + "' already exists in this department");
        }
        
        Course course = courseMapper.toEntity(courseDTO);
        course.setDepartment(department);
        
        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDTO(savedCourse);
    }
    
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        
        if (courseDTO.getCode() != null && !courseDTO.getCode().equals(existingCourse.getCode()) && 
            courseRepository.existsByCode(courseDTO.getCode())) {
            throw new DuplicateResourceException("Course with code '" + courseDTO.getCode() + "' already exists");
        }
        
        Department department = departmentRepository.findById(courseDTO.getDepartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartment().getId()));
        
        if (!existingCourse.getName().equals(courseDTO.getName()) || 
            !existingCourse.getDepartment().getId().equals(department.getId())) {
            if (courseRepository.existsByNameAndDepartmentId(courseDTO.getName(), department.getId())) {
                throw new DuplicateResourceException("Course with name '" + courseDTO.getName() + "' already exists in this department");
            }
        }
        
        existingCourse.setName(courseDTO.getName());
        existingCourse.setCode(courseDTO.getCode());
        existingCourse.setDepartment(department);
        
        Course updatedCourse = courseRepository.save(existingCourse);
        return courseMapper.toDTO(updatedCourse);
    }
    
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        
        courseRepository.deleteById(id);
    }
    
    public List<CourseDTO> searchCourses(String searchTerm) {
        List<Course> courses = courseRepository.searchCourses(searchTerm);
        return courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<CourseDTO> searchCoursesByDepartment(Long departmentId, String searchTerm) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        
        List<Course> courses = courseRepository.searchCoursesByDepartment(departmentId, searchTerm);
        return courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());
    }
}