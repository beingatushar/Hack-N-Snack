package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query(name = "Notification.markRead")
    void markRead(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query(name = "Notification.markAllRead")
    void markAllRead(@Param("userId") Long userId);
}
