package com.ucsmgy.projectcatalog.config;

import com.ucsmgy.projectcatalog.entities.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(Long userId, Notification notification) {
        String destination = "/topic/notifications/" + userId;
        messagingTemplate.convertAndSend(destination, notification);
        log.info("Notification sent to {}: {}", destination, notification.getId());
    }
}
