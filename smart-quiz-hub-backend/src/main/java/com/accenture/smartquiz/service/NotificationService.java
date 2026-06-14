package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.response.NotificationResponse;
import com.accenture.smartquiz.dto.response.PagedResponse;
import com.accenture.smartquiz.entity.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void push(Long userId, NotificationType type, String title, String message, Long questionId);

    PagedResponse<NotificationResponse> getForUser(Long userId, Pageable pageable);

    long countUnread(Long userId);

    void markRead(Long userId, Long notificationId);

    void markAllRead(Long userId);
}
