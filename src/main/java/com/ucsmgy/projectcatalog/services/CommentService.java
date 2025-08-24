package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.CommentDTO;
import com.ucsmgy.projectcatalog.dtos.CommentResponseDTO;
import com.ucsmgy.projectcatalog.entities.Comment;
import com.ucsmgy.projectcatalog.entities.Project;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.events.CommentCreatedEvent;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.mappers.CommentMapper;
import com.ucsmgy.projectcatalog.repositories.CommentRepository;
import com.ucsmgy.projectcatalog.repositories.ProjectRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CommentMapper commentMapper;
    private final ApplicationEventPublisher eventPublisher;

    public CommentResponseDTO createComment(CommentDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment comment = commentMapper.toEntity(dto);
        comment.setProject(project);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        User projectOwner = project.getUser();

        eventPublisher.publishEvent(new CommentCreatedEvent(this, project.getId(), savedComment.getId(), projectOwner.getId(), projectOwner.getRole(), savedComment.getComment(),user.getName()));


        return commentMapper.toDTO(savedComment);
    }

    public List<CommentResponseDTO> getCommentsByProject(Long projectId) {
        List<Comment> comments = commentRepository.findAllByProjectIdOrderByCreatedAtDesc(projectId);
        return comments.stream()
                .map(commentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("User not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }
}
