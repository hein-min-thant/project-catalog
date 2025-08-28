package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.entities.Notification;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.repositories.NotificationRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import com.ucsmgy.projectcatalog.config.WebSocketHandler;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketHandler webSocketHandler;


    public void saveAndSendNotification(Notification notification) {
        Notification savedNotification = notificationRepository.save(notification);

        webSocketHandler.sendNotificationToUser(
                notification.getRecipientUserId(),
                savedNotification
        );
    }

    public List<Notification> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findByIdAndRecipientUserId(notificationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByRecipientUserIdAndIsReadFalse(user.getId());
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findByIdAndRecipientUserId(notificationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notificationRepository.delete(notification);
    }

    @Transactional
    public void clearAllNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationRepository.deleteByRecipientUserId(user.getId());
    }

    public NotificationCount getNotificationCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long totalCount = notificationRepository.countByRecipientUserId(user.getId());
        long unreadCount = notificationRepository.countByRecipientUserIdAndIsReadFalse(user.getId());
        
        return new NotificationCount(unreadCount, totalCount);
    }

    @Setter
    @Getter
    public static class NotificationCount {
        private long unreadCount;
        private long totalCount;

        public NotificationCount(long unreadCount, long totalCount) {
            this.unreadCount = unreadCount;
            this.totalCount = totalCount;
        }

    }
}