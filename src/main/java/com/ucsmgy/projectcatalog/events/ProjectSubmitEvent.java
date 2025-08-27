package com.ucsmgy.projectcatalog.events;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Setter
@Getter
public class ProjectSubmitEvent extends ApplicationEvent {
    private final Long projectId;
    private final Long projectApproverId;
    private final String projectOwnerName;
    private final String projectTitle;
    private final String approverName;

    public ProjectSubmitEvent(Object source, Long projectId, Long projectApproverId,String projectOwnerName, String projectTitle, String approverName) {
        super(source);
        this.projectId = projectId;
        this.projectApproverId = projectApproverId;
        this.projectOwnerName = projectOwnerName;
        this.projectTitle = projectTitle;
        this.approverName = approverName;
    }
}