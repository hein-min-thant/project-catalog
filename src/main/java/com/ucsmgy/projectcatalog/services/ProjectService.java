package com.ucsmgy.projectcatalog.services;

import com.dropbox.core.DbxException;
import com.ucsmgy.projectcatalog.dtos.ProjectRequestDTO;
import com.ucsmgy.projectcatalog.dtos.ProjectResponseDTO;
import com.ucsmgy.projectcatalog.entities.*;
import com.ucsmgy.projectcatalog.entities.Project.Status;
import com.ucsmgy.projectcatalog.events.CommentCreatedEvent;
import com.ucsmgy.projectcatalog.events.ProjectApprovedEvent;
import com.ucsmgy.projectcatalog.events.ProjectRejectedEvent;
import com.ucsmgy.projectcatalog.events.ProjectSubmitEvent;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.mappers.ProjectMapper;
import com.ucsmgy.projectcatalog.repositories.*;
import com.ucsmgy.projectcatalog.util.HtmlImageProcessor;
import com.ucsmgy.projectcatalog.util.HtmlSanitizer;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;

import static com.ucsmgy.projectcatalog.mappers.ProjectMapper.objectMapper;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final CloudStorageService cloudStorageService;
    private final ProjectMapper projectMapper;
    private final ImgbbService imgbbService;
    private final TagRepository tagRepository;
    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ProjectResponseDTO create(ProjectRequestDTO dto, Long userId ,Map<String, String> membersMap) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found"));

            Project project = projectMapper.toEntity(dto);
            project.setUser(user);

            if ("ADMIN".equals(user.getRole())) {
                project.setApprovalStatus(Project.ApprovalStatus.APPROVED);
                project.setApprovedAt(LocalDateTime.now());
                project.setApprovedBy(user);
            } else {
                // Regular users need supervisor approval
                if (dto.getSupervisorId() != null) {
                    User supervisor = userRepository.findById(dto.getSupervisorId())
                            .orElseThrow(() -> new EntityNotFoundException("Supervisor with ID " + dto.getSupervisorId() + " not found"));
                    
                    // Verify the supervisor has SUPERVISOR role
                    if (!"SUPERVISOR".equals(supervisor.getRole()) && !"ADMIN".equals(supervisor.getRole())) {
                        throw new RuntimeException("User with ID " + dto.getSupervisorId() + " is not a supervisor");
                    }
                    
                    project.setSupervisor(supervisor);
                } else {
                    throw new RuntimeException("Supervisor ID is required for non-admin users");
                }
                project.setApprovalStatus(Project.ApprovalStatus.PENDING);
            }
            
            applyDtoUpdatesAndUploads(project, dto , membersMap);

            Project savedProject = projectRepository.save(project);
            if ("ADMIN".equals(user.getRole())){
                project.setApprovalStatus(Project.ApprovalStatus.valueOf("APPROVED"));
                eventPublisher.publishEvent(new ProjectSubmitEvent(this,project.getId(),user.getId(),user.getName(),project.getTitle(), user.getName()));
            }else {
                eventPublisher.publishEvent(new ProjectSubmitEvent(this, project.getId(), dto.getSupervisorId(), user.getName(), project.getTitle(), project.getSupervisor().getName()));
            }
            return projectMapper.toDTO(savedProject);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create project", e);
        }
    }

    @Transactional
    public ProjectResponseDTO update(Long projectId,Long userId, ProjectRequestDTO dto, Map<String, String> membersMap) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        projectMapper.updateFromDto(dto, project);
        applyDtoUpdatesAndUploads(project, dto ,membersMap);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found"));

        if ("ADMIN".equals(user.getRole())){
            project.setApprovalStatus(Project.ApprovalStatus.valueOf("APPROVED"));
            eventPublisher.publishEvent(new ProjectSubmitEvent(this,project.getId(),user.getId(),user.getName(),project.getTitle(), user.getName()));
        }else {
            eventPublisher.publishEvent(new ProjectSubmitEvent(this, project.getId(), dto.getSupervisorId(), user.getName(), project.getTitle(), project.getSupervisor().getName()));
        }
        return projectMapper.toDTO(projectRepository.save(project));
    }

    private void applyDtoUpdatesAndUploads(Project project, ProjectRequestDTO dto ,Map<String, String> membersMap) {
        if (dto.getBody() != null) {
            String processedBody = HtmlImageProcessor.processImages(dto.getBody(), imgbbService);
            Document doc = Jsoup.parse(processedBody);
            Element img= doc.selectFirst("img");
            String src = img != null ? img.attr("src") : null;
            project.setCoverImageUrl(src);

            project.setBody(processedBody);
        }
        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department with ID " + dto.getDepartmentId() + " not found"));
            project.setDepartment(department);
        }
        
        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new EntityNotFoundException("Course with ID " + dto.getCourseId() + " not found"));
            project.setCourse(course);
        }
        if(dto.getAcademic_year() != null){
            project.setAcademic_year(dto.getAcademic_year());
        }

        if(dto.getStudent_year() != null){
            project.setStudent_year(dto.getStudent_year());
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
        } else if (dto.getTagsJson() != null && !dto.getTagsJson().isEmpty()) {
            // Parse tags from JSON string if tags list is empty
            try {
                List<String> tagNames = objectMapper.readValue(dto.getTagsJson(), new TypeReference<List<String>>() {});
                Set<Tag> tagEntities = tagNames.stream()
                        .filter(name -> name != null && !name.trim().isEmpty())
                        .map(name -> tagRepository.findByNameIgnoreCase(name.trim())
                                .orElseGet(() -> {
                                    Tag newTag = new Tag();
                                    newTag.setName(name.trim());
                                    return tagRepository.save(newTag);
                                }))
                        .collect(Collectors.toSet());
                project.setTags(tagEntities);
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse tags JSON", e);
            }
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

    public Page<ProjectResponseDTO> getApprovedProjects(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return projectRepository.findByApprovalStatus(Project.ApprovalStatus.APPROVED, pageable)
                .map(projectMapper::toDTO);
    }

    public List<ProjectResponseDTO> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId)
                .stream()
                .map(projectMapper::toDTO)
                .toList();
    }


    public ProjectResponseDTO getById(Long id) {
        return projectMapper.toDTO(
                projectRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Project with ID " + id + " not found"))
        );
    }

    public Page<ProjectResponseDTO> search(
            Optional<String> keyword,
            Optional<Long> departmentId,
            Optional<Long> courseId,
            Optional<String> tags,
            Optional<String> academicYear,
            Optional<String> studentYear,
            Optional<String> name,
            Optional<String> supervisor,
            Optional<String> members,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Project> spec = new ProjectSpecification(keyword, departmentId, courseId, tags, academicYear,studentYear,name, supervisor, members);

        return projectRepository.findAll(spec, pageable).map(projectMapper::toDTO);
    }

    public Page<ProjectResponseDTO> searchApprovedProjects(
            Optional<String> keyword,
            Optional<Long> departmentId,
            Optional<Long> courseId,
            Optional<String> tags,
            Optional<String> academicYear,
            Optional<String> studentYear,
            Optional<String> name,
            Optional<String> supervisor,
            Optional<String> members,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Project> spec = new ProjectSpecification(keyword, departmentId, courseId, tags, academicYear,studentYear,name, supervisor, members)
                .and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("approvalStatus"), Project.ApprovalStatus.APPROVED));

        return projectRepository.findAll(spec, pageable).map(projectMapper::toDTO);
    }

    @RequiredArgsConstructor
    private static class ProjectSpecification implements Specification<Project> {
        private final Optional<String> keyword;
        private final Optional<Long> departmentId;
        private final Optional<Long> courseId;
        private final Optional<String> tags;
        private final Optional<String> academicYear;
        private final Optional<String> studentYear;
        private final Optional<String> name;
        private final Optional<String> supervisor;
        private final Optional<String> members;

        @Override
        public Predicate toPredicate(Root<Project> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
            List<Predicate> predicates = new ArrayList<>();

            keyword.ifPresent(k -> {
                String likeKeyword = "%" + k.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword);
                Predicate bodyPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("body")), likeKeyword);
                predicates.add(criteriaBuilder.or(titlePredicate, bodyPredicate));
            });

            departmentId.ifPresent(deptId ->
                    predicates.add(criteriaBuilder.equal(root.get("department").get("id"), deptId))
            );

            courseId.ifPresent(courseId ->
                    predicates.add(criteriaBuilder.equal(root.get("course").get("id"), courseId))
            );

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

            supervisor.ifPresent(sup -> {
                Join<Project, User> supervisorJoin = root.join("supervisor", JoinType.LEFT);
                String likeSupervisor = "%" + sup.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(supervisorJoin.get("name")), likeSupervisor));
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

    @Transactional
    public ProjectResponseDTO approveProject(Long projectId, Long approverId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID " + approverId + " not found"));
        
        // Check if the user is the supervisor or an admin
        if ((project.getSupervisor() == null || !approver.getId().equals(project.getSupervisor().getId())) && 
            !"ADMIN".equals(approver.getRole()) && !"SUPERVISOR".equals(approver.getRole())) {
            throw new RuntimeException("User is not authorized to approve this project");
        }

        project.setApprovalStatus(Project.ApprovalStatus.APPROVED);
        project.setApprovedAt(LocalDateTime.now());
        project.setApprovedBy(approver);
        
        Project savedProject = projectRepository.save(project);
        User projectOwner = project.getUser();
        eventPublisher.publishEvent(new ProjectApprovedEvent(this, project.getId(), projectOwner.getId(), project.getTitle(), project.getApprovedBy().getName()));
        return projectMapper.toDTO(savedProject);
    }

    @Transactional
    public ProjectResponseDTO rejectProject(Long projectId, Long rejecterId, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        
        User rejecter = userRepository.findById(rejecterId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID " + rejecterId + " not found"));

        if ((project.getSupervisor() == null || !rejecter.getId().equals(project.getSupervisor().getId())) && 
            !"ADMIN".equals(rejecter.getRole()) && !"SUPERVISOR".equals(rejecter.getRole())) {
            throw new RuntimeException("User is not authorized to reject this project");
        }
        
        project.setApprovalStatus(Project.ApprovalStatus.REJECTED);
        project.setApprovedAt(LocalDateTime.now());
        project.setApprovedBy(rejecter);
        Project savedProject = projectRepository.save(project);

        User projectOwner = project.getUser();
        eventPublisher.publishEvent(new ProjectRejectedEvent(this, project.getId(), projectOwner.getId(), project.getTitle(), project.getApprovedBy().getName(),reason));
        return projectMapper.toDTO(savedProject);
    }

    public List<ProjectResponseDTO> getProjectsPendingApproval(Long supervisorId) {
        return projectRepository.findBySupervisorIdAndApprovalStatus(supervisorId, Project.ApprovalStatus.PENDING)
                .stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectResponseDTO> getProjectsByApprovalStatus(Project.ApprovalStatus status) {
        return projectRepository.findByApprovalStatus(status)
                .stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectResponseDTO> getProjectsWithoutSupervisor() {
        return projectRepository.findBySupervisorIsNullAndApprovalStatus(Project.ApprovalStatus.PENDING)
                .stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponseDTO assignSupervisor(Long projectId, Long supervisorId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new EntityNotFoundException("Supervisor with ID " + supervisorId + " not found"));
        
        project.setSupervisor(supervisor);
        
        Project savedProject = projectRepository.save(project);
        return projectMapper.toDTO(savedProject);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project with ID " + projectId + " not found"));
        
        projectRepository.delete(project);
    }
}