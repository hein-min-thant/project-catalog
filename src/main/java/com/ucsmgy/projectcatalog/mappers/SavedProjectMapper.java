package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.SavedProjectDTO;
import com.ucsmgy.projectcatalog.dtos.SavedProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.SavedProject;
import com.ucsmgy.projectcatalog.entities.Department;
import com.ucsmgy.projectcatalog.entities.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SavedProjectMapper {

    @Mapping(target = "project", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "savedAt", ignore = true)
    SavedProject toEntity(SavedProjectDTO dto);

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.title", target = "projectTitle")
    @Mapping(source = "user.id", target = "userId")

    @Mapping(source = "project.department.id" ,target = "departmentId")
    @Mapping(source = "project.course.id" ,target = "courseId")
    @Mapping(source = "project.coverImageUrl" ,target = "coverImageUrl")
    @Mapping(source = "project.academic_year" ,target = "academic_year")
    @Mapping(source = "project.student_year" ,target = "student_year")
    @Mapping(source = "project.description", target ="projectDescription")
    SavedProjectResponseDTO toDTO(SavedProject savedProject);

    default Long mapDepartment(Department department) {
        return department != null ? department.getId() : null;
    }
    
    default Long mapCourse(Course course) {
        return course != null ? course.getId() : null;
    }
}