package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    List<Notification> findByRecipientUserIdAndIsReadFalse(Long recipientUserId);
    Optional<Notification> findByIdAndRecipientUserId(Long id, Long recipientUserId);
    long countByRecipientUserId(Long recipientUserId);
    long countByRecipientUserIdAndIsReadFalse(Long recipientUserId);
    void deleteByRecipientUserId(Long recipientUserId);
}