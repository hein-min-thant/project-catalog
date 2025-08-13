package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.MemberDTO;
import com.ucsmgy.projectcatalog.entities.Member;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MemberMapper {
    MemberDTO toDTO(Member category);
    Member toEntity(MemberDTO dto);
}
