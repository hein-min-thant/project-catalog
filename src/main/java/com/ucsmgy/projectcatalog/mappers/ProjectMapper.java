package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.ProjectFile;
import com.ucsmgy.projectcatalog.entities.Tag;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "excerpt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "reactions", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "files", ignore = true) // handled separately in service
    @Mapping(target = "savedByUsers", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(source = "status", target = "status", qualifiedByName = "mapStatus")
    Project toEntity(ProjectRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "files", ignore = true)
    @Mapping(target = "tags", ignore = true) // <-- FIX: Ignore tag mapping here
    @Mapping(source = "status", target = "status", qualifiedByName = "mapStatus")
    void updateFromDto(ProjectRequestDTO dto, @MappingTarget Project project);

    @Mapping(target = "projectFiles", expression = "java(mapFiles(project))")
    @Mapping(target = "tags", expression = "java(mapTags(project))")
    ProjectResponseDTO toDTO(Project project);


    @Named("mapStatus")
    default Project.Status mapStatus(String status) {
        if (status == null) {
            return null;
        }
        return Project.Status.valueOf(status.toUpperCase());
    }

    default Set<Tag> mapTagsFromStrings(List<String> tagNames) {
        if (tagNames == null) return Set.of();
        return tagNames.stream()
                .filter(name -> name != null && !name.isBlank())
                .map(name -> {
                    Tag tag = new Tag();
                    tag.setName(name.trim());
                    return tag;
                })
                .collect(Collectors.toSet());
    }

    default List<String> mapTags(Project project) {
        if (project.getTags() == null) return List.of();
        return project.getTags().stream()
                .map(Tag::getName)
                .toList();
    }

    default List<String> mapFiles(Project project) {
        if (project.getFiles() == null) return List.of();
        return project.getFiles().stream()
                .map(ProjectFile::getFilePath)
                .toList();
    }
}


