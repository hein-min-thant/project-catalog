package com.ucsmgy.projectcatalog.dtos;

import lombok.Data;

@Data
public class MemberDTO {
    private String name;        // required
    private String rollNumber;  // optional
}

