package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Project;
import org.hibernate.search.mapper.pojo.common.annotation.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> , JpaSpecificationExecutor<Project> {
    @Query("SELECT DISTINCT p FROM Project p JOIN p.tags t WHERE LOWER(t.name) = LOWER(:tagName)")
    List<Project> findByTagName(@Param(name = "", value = "tagName") String tagName);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.tags t WHERE LOWER(t.name) IN :tagNames")
    List<Project> findByTagNames(@Param(name = "", value = "tagNames") List<String> tagNames);
}