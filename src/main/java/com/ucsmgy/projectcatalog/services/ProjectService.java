package com.ucsmgy.projectcatalog.services;

import com.dropbox.core.DbxException;
import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.*;
import com.ucsmgy.projectcatalog.entities.Project.Status;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.mappers.ProjectMapper;
import com.ucsmgy.projectcatalog.repositories.CategoryRepository;
import com.ucsmgy.projectcatalog.repositories.ProjectRepository;
import com.ucsmgy.projectcatalog.repositories.TagRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import com.ucsmgy.projectcatalog.util.HtmlImageProcessor;
import com.ucsmgy.projectcatalog.util.HtmlSanitizer;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CloudStorageService cloudStorageService;
    private final ProjectMapper projectMapper;
    private final ImgbbService imgbbService;
    private final TagRepository tagRepository;

    @Transactional
    public ProjectResponseDTO create(ProjectRequestDTO dto, Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found"));

            Project project = projectMapper.toEntity(dto);
            project.setUser(user);
            applyDtoUpdatesAndUploads(project, dto);

            Project savedProject = projectRepository.save(project);

            return projectMapper.toDTO(savedProject);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create project", e);
        }
    }

    @Transactional
    public ProjectResponseDTO update(Long projectId, ProjectRequestDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        projectMapper.updateFromDto(dto, project);

        applyDtoUpdatesAndUploads(project, dto);

        return projectMapper.toDTO(projectRepository.save(project));
    }

    private void applyDtoUpdatesAndUploads(Project project, ProjectRequestDTO dto) {
        if (dto.getBody() != null) {
            String processedBody = HtmlImageProcessor.processImages(dto.getBody(), imgbbService);
            String sanitizedBody = HtmlSanitizer.sanitize(processedBody);
            project.setBody(sanitizedBody);
        }
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category with ID " + dto.getCategoryId() + " not found"));
            project.setCategory(category);
        }
        if(dto.getAcademic_year() != null){
            project.setAcademic_year(dto.getAcademic_year());
        }

        if(dto.getStudent_year() != null){
            project.setStudent_year(dto.getStudent_year());
        }
        if (dto.getStatus() != null) {
            project.setStatus(Status.fromValue(dto.getStatus()));
        }
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            Set<Tag> tagEntities = dto.getTags().stream()
                    .map(name -> tagRepository.findByNameIgnoreCase(name)
                            .orElseGet(() -> {
                                Tag newTag = new Tag();
                                newTag.setName(name.trim());
                                return tagRepository.save(newTag);
                            }))
                    .collect(Collectors.toSet());
            project.setTags(tagEntities);
        }

        if (dto.getProjectFiles() != null && !dto.getProjectFiles().isEmpty()) {
            for (MultipartFile file : dto.getProjectFiles()) {
                if (!file.isEmpty()) {
                    try {
                        String fileUrl = cloudStorageService.uploadFile(file);
                        ProjectFile projectFile = new ProjectFile();
                        projectFile.setFilePath(fileUrl);
                        projectFile.setProject(project);
                        project.getFiles().add(projectFile);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload file " + file.getOriginalFilename(), e);
                    } catch (DbxException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        }
    }

    public Page<ProjectResponseDTO> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return projectRepository.findAll(pageable).map(projectMapper::toDTO);
    }

    public ProjectResponseDTO getById(Long id) {
        return projectMapper.toDTO(
                projectRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Project with ID " + id + " not found"))
        );
    }

    public Page<ProjectResponseDTO> search(
            Optional<String> keyword,
            Optional<Long> categoryId,
            Optional<String> status,
            Optional<String> tags,
            Optional<String> academicYear, // NEW
            Optional<String> studentYear,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Project> spec = new ProjectSpecification(keyword, categoryId, status, tags, academicYear,studentYear);

        return projectRepository.findAll(spec, pageable).map(projectMapper::toDTO);
    }

    @RequiredArgsConstructor
    private static class ProjectSpecification implements Specification<Project> {
        private final Optional<String> keyword;
        private final Optional<Long> categoryId;
        private final Optional<String> status;
        private final Optional<String> tags;
        private final Optional<String> academicYear;
        private final Optional<String> studentYear;

        @Override
        public Predicate toPredicate(jakarta.persistence.criteria.Root<Project> root, jakarta.persistence.criteria.CriteriaQuery<?> query, jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
            List<Predicate> predicates = new ArrayList<>();

            keyword.ifPresent(k -> {
                String likeKeyword = "%" + k.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword);
                Predicate bodyPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("body")), likeKeyword);
                predicates.add(criteriaBuilder.or(titlePredicate, bodyPredicate));
            });

            categoryId.ifPresent(catId ->
                    predicates.add(criteriaBuilder.equal(root.get("category").get("id"), catId))
            );

            status.ifPresent(s -> {
                try {
                    Status projectStatus = Status.fromValue(s);
                    predicates.add(criteriaBuilder.equal(root.get("status"), projectStatus));
                } catch (IllegalArgumentException e) {
                    // Log or handle invalid status values
                }
            });

            tags.ifPresent(tagNames -> {
                Set<String> tagList = Set.of(tagNames.split(","));
                if (!tagList.isEmpty()) {
                    Join<Project, Tag> tagsJoin = root.join("tags");
                    predicates.add(tagsJoin.get("name").in(tagList));
                    // Add distinct to prevent duplicate results for projects with multiple matching tags
                    query.distinct(true);
                }
            });

            academicYear.ifPresent(year ->
                    predicates.add(criteriaBuilder.equal(root.get("academic_year"), year))
            );

            studentYear.ifPresent(year ->
                    predicates.add(criteriaBuilder.equal(root.get("student_year"), year))
            );


            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        }
    }
}