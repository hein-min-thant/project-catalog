package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByDepartmentId(Long departmentId);
    
    Optional<Course> findByCode(String code);
    
    @Query("SELECT c FROM Course c WHERE c.name LIKE %:searchTerm% OR c.code LIKE %:searchTerm%")
    List<Course> searchCourses(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Course c WHERE c.department.id = :departmentId AND (c.name LIKE %:searchTerm% OR c.code LIKE %:searchTerm%)")
    List<Course> searchCoursesByDepartment(@Param("departmentId") Long departmentId, @Param("searchTerm") String searchTerm);
    
    boolean existsByCode(String code);
    
    boolean existsByNameAndDepartmentId(String name, Long departmentId);
}
