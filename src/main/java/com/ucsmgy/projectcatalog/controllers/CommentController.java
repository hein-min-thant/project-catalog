package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.dtos.CommentDTO;
import com.ucsmgy.projectcatalog.dtos.CommentResponseDTO;
import com.ucsmgy.projectcatalog.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponseDTO> addComment(@RequestBody CommentDTO dto) {
        CommentResponseDTO response = commentService.createComment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByProject(@PathVariable Long projectId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByProject(projectId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}

