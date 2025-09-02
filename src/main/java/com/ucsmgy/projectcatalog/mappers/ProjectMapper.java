package com.ucsmgy.projectcatalog.mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.Project.ApprovalStatus; // Import the ApprovalStatus enum
import com.ucsmgy.projectcatalog.entities.ProjectFile;
import com.ucsmgy.projectcatalog.entities.Tag;
import org.mapstruct.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ObjectMapper objectMapper = new ObjectMapper();
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "excerpt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "course", ignore = true)  
    @Mapping(target = "reactions", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "files", ignore = true) // handled separately in service
    @Mapping(target = "savedByUsers", ignore = true)
    @Mapping(target = "tags", ignore = true)
    Project toEntity(ProjectRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "files", ignore = true)
    @Mapping(target = "tags", source = "tags", qualifiedByName = "mapTagStringsToEntities")
    @Mapping(target = "approvalStatus", source = "approvalStatus", qualifiedByName = "mapApprovalStatus") // Corrected mapping
    void updateFromDto(ProjectRequestDTO dto, @MappingTarget Project project);

    @Mapping(target = "projectFiles", expression = "java(mapFiles(project))")
    @Mapping(target = "tags", expression = "java(mapTags(project))")
    @Mapping(target = "membersJson", expression = "java(mapMembers(project))")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "supervisor.id", target = "supervisorId")
    @Mapping(source = "supervisor.name", target = "supervisorName")
    @Mapping(source = "approvalStatus", target = "approvalStatus")
    @Mapping(source = "approvedAt", target = "approvedAt")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(source = "approvedBy.name", target = "approvedByName")
    ProjectResponseDTO toDTO(Project project);


    // Use the correct enum and a new method name for clarity
    @Named("mapApprovalStatus")
    default ApprovalStatus mapApprovalStatus(String approvalStatus) {
        if (approvalStatus == null) {
            return null;
        }
        return ApprovalStatus.valueOf(approvalStatus.toUpperCase());
    }

    @Named("mapTagStringsToEntities")
    default Set<Tag> mapTagStringsToEntities(List<String> tagNames) {
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

    default String mapMembers(Project project) {
        if (project.getMembers() == null || project.getMembers().isEmpty()) {
            return "[]";
        }

        List<Map<String, String>> membersList = project.getMembers().stream()
                .map(m -> Map.of(
                        "name", m.getName(),
                        "rollNumber", m.getRollNumber() != null ? m.getRollNumber() : ""
                ))
                .toList();

        try {
            return objectMapper.writeValueAsString(membersList);
        } catch (JsonProcessingException e) {
            return "[]"; // fallback
        }
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