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

            notificationService.saveAndSendNotification(notification);
        }
    }
}
