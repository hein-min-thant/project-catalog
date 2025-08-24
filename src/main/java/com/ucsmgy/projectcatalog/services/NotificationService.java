package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.entities.Notification;
import com.ucsmgy.projectcatalog.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void saveAndSendNotification(Notification notification) {
        Notification savedNotification = notificationRepository.save(notification);

        // Send via WebSocket to the user's specific topic
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + savedNotification.getRecipientUserId(),
                savedNotification
        );
    }
}