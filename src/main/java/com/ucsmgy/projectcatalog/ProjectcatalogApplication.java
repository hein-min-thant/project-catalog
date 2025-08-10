package com.ucsmgy.projectcatalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.ucsmgy.projectcatalog.entities")
public class ProjectcatalogApplication {
	public static void main(String[] args) {
		SpringApplication.run(ProjectcatalogApplication.class, args);
	}
}
