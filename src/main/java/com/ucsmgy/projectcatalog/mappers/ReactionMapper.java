package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.ReactionDTO;
import com.ucsmgy.projectcatalog.entities.Reaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReactionMapper {
    ReactionDTO toDTO(Reaction reaction);
    Reaction toEntity(ReactionDTO dto);
}