package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByProjectIdOrderByCreatedAtDesc(Long projectId);
}