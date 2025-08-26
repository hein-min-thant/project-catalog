package com.ucsmgy.projectcatalog.events;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Setter
@Getter
public class ProjectApprovedEvent extends ApplicationEvent {
    private final Long projectId;
    private final Long projectOwnerId;
    private final String projectTitle;
    private final String approverName;
    private final String approvalReason;

    public ProjectApprovedEvent(Object source, Long projectId, Long projectOwnerId, String projectTitle, String approverName, String approvalReason) {
        super(source);
        this.projectId = projectId;
        this.projectOwnerId = projectOwnerId;
        this.projectTitle = projectTitle;
        this.approverName = approverName;
        this.approvalReason = approvalReason;
    }
}
