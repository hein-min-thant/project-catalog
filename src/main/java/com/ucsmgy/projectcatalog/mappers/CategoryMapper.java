package com.ucsmgy.projectcatalog.mappers;

import com.ucsmgy.projectcatalog.dtos.CategoryDTO;
import com.ucsmgy.projectcatalog.entities.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO dto);
}

