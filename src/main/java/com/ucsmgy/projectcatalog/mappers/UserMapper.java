package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.CreateUserDto;
import com.ucsmgy.projectcatalog.dtos.UserDto;
import com.ucsmgy.projectcatalog.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(CreateUserDto request);
}
