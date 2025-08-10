package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.SavedProjectDTO;
import com.ucsmgy.projectcatalog.dtos.SavedProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.SavedProject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SavedProjectMapper {

    @Mapping(target = "project", ignore = true) // set in service
    @Mapping(target = "user", ignore = true)    // set in service
    @Mapping(target = "savedAt", ignore = true)
    SavedProject toEntity(SavedProjectDTO dto);

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.title", target = "projectTitle")
    @Mapping(source = "user.id", target = "userId")
    SavedProjectResponseDTO toDTO(SavedProject savedProject);
}

