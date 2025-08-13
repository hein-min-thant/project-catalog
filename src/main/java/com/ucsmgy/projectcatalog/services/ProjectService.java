package com.ucsmgy.projectcatalog.services;

import com.dropbox.core.DbxException;
import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.*;
import com.ucsmgy.projectcatalog.entities.Project.Status;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.mappers.ProjectMapper;
import com.ucsmgy.projectcatalog.repositories.*;
import com.ucsmgy.projectcatalog.util.HtmlImageProcessor;
import com.ucsmgy.projectcatalog.util.HtmlSanitizer;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
import java.util.*;
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
    private final MemberRepository memberRepository;

    @Transactional
    public ProjectResponseDTO create(ProjectRequestDTO dto, Long userId ,Map<String, String> membersMap) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found"));

            Project project = projectMapper.toEntity(dto);
            project.setUser(user);
            applyDtoUpdatesAndUploads(project, dto , membersMap);

            Project savedProject = projectRepository.save(project);

            return projectMapper.toDTO(savedProject);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create project", e);
        }
    }

    @Transactional
    public ProjectResponseDTO update(Long projectId, ProjectRequestDTO dto, Map<String, String> membersMap) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        projectMapper.updateFromDto(dto, project);

        applyDtoUpdatesAndUploads(project, dto ,membersMap);

        return projectMapper.toDTO(projectRepository.save(project));
    }

    private void applyDtoUpdatesAndUploads(Project project, ProjectRequestDTO dto ,Map<String, String> membersMap) {
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


        if (membersMap != null && !membersMap.isEmpty()) {
            Set<Member> memberEntities = membersMap.entrySet().stream()
                    .map(entry -> {
                        String name = entry.getKey().trim();
                        String rollNumber = entry.getValue();

                        return memberRepository.findByNameIgnoreCase(name)
                                .orElseGet(() -> {
                                    Member newMember = new Member();
                                    newMember.setName(name);
                                    if (rollNumber != null && !rollNumber.isEmpty()) {
                                        newMember.setRollNumber(rollNumber.trim());
                                    }
                                    return memberRepository.save(newMember);
                                });
                    })
                    .collect(Collectors.toSet());

            project.setMembers(memberEntities);
        }

        if (dto.getProjectFiles() != null && !dto.getProjectFiles().isEmpty()) {
            for (MultipartFile file : dto.getProjectFiles()) {
                if (!file.isEmpty()) {
                    try {
                        String fileUrl = cloudStorageService.uploadFile(file);
                        String downloadUrl = fileUrl.replace("dl=0", "dl=1");
                        ProjectFile projectFile = new ProjectFile();
                        projectFile.setFilePath(downloadUrl);
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
            Optional<String> academicYear,
            Optional<String> studentYear,
            Optional<String> name,
            Optional<String> members,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Project> spec = new ProjectSpecification(keyword, categoryId, status, tags, academicYear,studentYear,name, members);

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
        private final Optional<String> name;
        private final Optional<String> members;

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
                    query.distinct(true);
                }
            });

            academicYear.ifPresent(year ->
                    predicates.add(criteriaBuilder.equal(root.get("academic_year"), year))
            );

            studentYear.ifPresent(year ->
                    predicates.add(criteriaBuilder.equal(root.get("student_year"), year))
            );

            name.ifPresent(n -> {
                Join<Project, User> userJoin = root.join("user", JoinType.LEFT);
                predicates.add(criteriaBuilder.equal(userJoin.get("name"), n));
            });


            // from source: 44, 45
            members.ifPresent(MemberNames -> {
                Set<String> memberList = Set.of(MemberNames.split(","));
                if (!memberList.isEmpty()) {
                    Join<Project, Member> MemberJoin = root.join("members"); // Correctly joins the members table
                    predicates.add(MemberJoin.get("name").in(memberList));   // Correctly filters by the list of member names
                    query.distinct(true);
                }
            });

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        }
    }
}