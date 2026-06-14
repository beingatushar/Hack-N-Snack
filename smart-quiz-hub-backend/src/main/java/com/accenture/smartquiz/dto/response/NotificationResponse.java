package com.accenture.smartquiz.dto.response;

import com.accenture.smartquiz.entity.Notification;
import com.accenture.smartquiz.entity.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long questionId;
    private boolean read;
    private Instant createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .questionId(n.getQuestionId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
