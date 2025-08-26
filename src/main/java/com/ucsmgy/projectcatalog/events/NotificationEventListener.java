package com.ucsmgy.projectcatalog.events;

import com.ucsmgy.projectcatalog.entities.Notification;
import com.ucsmgy.projectcatalog.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {
    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        if (!"ADMIN".equalsIgnoreCase(event.getProjectOwnerRole())) {
            Notification notification = new Notification();
            notification.setRecipientUserId(event.getProjectOwnerId());
            notification.setMessage(event.getCommenterName() + " commented on your project.");
            notification.setProjectId(event.getProjectId());
            notification.setCommentId(event.getCommentId());
            notification.setNotificationType("COMMENT");
            notification.setCommentText(event.getCommentText());
            notification.setCommenterName(event.getCommenterName());

            notificationService.saveAndSendNotification(notification);
        }
    }

    @Async
    @EventListener
    public void handleProjectApproved(ProjectApprovedEvent event) {
        Notification notification = new Notification();
        notification.setRecipientUserId(event.getProjectOwnerId());
        notification.setMessage("Your project '" + event.getProjectTitle() + "' has been approved by " + event.getApproverName());
        notification.setProjectId(event.getProjectId());
        notification.setNotificationType("APPROVAL");
        notification.setProjectTitle(event.getProjectTitle());
        notification.setApproverName(event.getApproverName());

        notificationService.saveAndSendNotification(notification);
    }

    @Async
    @EventListener
    public void handleProjectRejected(ProjectRejectedEvent event) {
        Notification notification = new Notification();
        notification.setRecipientUserId(event.getProjectOwnerId());
        notification.setMessage("Your project '" + event.getProjectTitle() + "' has been rejected by " + event.getRejectorName());
        notification.setProjectId(event.getProjectId());
        notification.setNotificationType("REJECTION");
        notification.setProjectTitle(event.getProjectTitle());
        notification.setRejectionReason(event.getRejectionReason());

        notificationService.saveAndSendNotification(notification);
    }
}
