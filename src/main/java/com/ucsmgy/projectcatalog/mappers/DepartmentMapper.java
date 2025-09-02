package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.DepartmentDTO;
import com.ucsmgy.projectcatalog.entities.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    
    DepartmentDTO toDTO(Department department);
    
    @Mapping(target = "courses", ignore = true)
    @Mapping(target = "projects", ignore = true)
    Department toEntity(DepartmentDTO departmentDTO);
}