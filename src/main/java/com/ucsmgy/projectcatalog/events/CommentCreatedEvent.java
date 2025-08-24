package com.ucsmgy.projectcatalog.events;


import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Setter
@Getter
public class CommentCreatedEvent extends ApplicationEvent {
    private final Long projectId;
    private final Long commentId;
    private final Long projectOwnerId;
    private final String projectOwnerRole;
    private final String commentText;
    private final String commenterName;

    public CommentCreatedEvent(Object source, Long projectId, Long commentId, Long projectOwnerId, String projectOwnerRole, String commentText, String commenterName) {
        super(source);
        this.projectId = projectId;
        this.commentId = commentId;
        this.projectOwnerId = projectOwnerId;
        this.projectOwnerRole = projectOwnerRole;
        this.commentText = commentText;
        this.commenterName = commenterName;
    }
}
