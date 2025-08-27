package com.ucsmgy.projectcatalog.events;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Setter
@Getter
public class ReactionEvent extends ApplicationEvent {
    private final Long projectId;
    private final Long projectOwnerId;
    private final Long reactionId;
    private final String projectTitle;
    private final String reactorName;

    public ReactionEvent(Object source, Long projectId, Long projectOwnerId,Long reactionId, String projectTitle, String reactorName) {
        super(source);
        this.projectId = projectId;
        this.projectOwnerId = projectOwnerId;
        this.reactionId = reactionId;
        this.projectTitle = projectTitle;
        this.reactorName = reactorName;
    }
}