package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.Notification;
import org.hibernate.search.mapper.pojo.common.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientUserId = :userId")
    void deleteByRecipientUserId(@Param(name = "userId", value = "userId") Long userId);
}