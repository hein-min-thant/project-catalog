package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByName(String name);
    
    @Query("SELECT d FROM Department d WHERE d.name LIKE %:searchTerm%")
    List<Department> searchDepartments(@Param("searchTerm") String searchTerm);
    
    boolean existsByName(String name);
}