package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.CourseDTO;
import com.ucsmgy.projectcatalog.entities.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {DepartmentMapper.class})
public interface CourseMapper {

    CourseDTO toDTO(Course course);
    
    @Mapping(target = "projects", ignore = true)
    Course toEntity(CourseDTO courseDTO);
}