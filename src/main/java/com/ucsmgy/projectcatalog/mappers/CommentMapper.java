package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.CommentDTO;
import com.ucsmgy.projectcatalog.dtos.CommentResponseDTO;
import com.ucsmgy.projectcatalog.entities.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "project", ignore = true) // handled in service
    @Mapping(target = "user", ignore = true)    // handled in service
    @Mapping(target = "createdAt", ignore = true)
    Comment toEntity(CommentDTO dto);

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    CommentResponseDTO toDTO(Comment comment);
}
