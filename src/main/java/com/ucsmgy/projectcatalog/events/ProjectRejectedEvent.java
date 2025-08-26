package com.ucsmgy.projectcatalog.events;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Setter
@Getter
public class ProjectRejectedEvent extends ApplicationEvent {
    private final Long projectId;
    private final Long projectOwnerId;
    private final String projectTitle;
    private final String rejectorName;
    private final String rejectionReason;

    public ProjectRejectedEvent(Object source, Long projectId, Long projectOwnerId, String projectTitle, String rejectorName, String rejectionReason) {
        super(source);
        this.projectId = projectId;
        this.projectOwnerId = projectOwnerId;
        this.projectTitle = projectTitle;
        this.rejectorName = rejectorName;
        this.rejectionReason = rejectionReason;
    }
}
