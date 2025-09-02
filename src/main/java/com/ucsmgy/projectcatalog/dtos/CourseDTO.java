package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String name;
    private String code;
    private DepartmentDTO department;
}