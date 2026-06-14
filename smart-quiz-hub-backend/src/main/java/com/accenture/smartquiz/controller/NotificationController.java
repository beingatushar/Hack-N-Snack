package com.accenture.smartquiz.controller;

import com.accenture.smartquiz.dto.response.ApiResponse;
import com.accenture.smartquiz.dto.response.NotificationResponse;
import com.accenture.smartquiz.dto.response.PagedResponse;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification feed")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications for the current user (paged, newest first)")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal SmartQuizUserDetails currentUser) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getForUser(currentUser.getUserId(), pageable)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal SmartQuizUserDetails currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.countUnread(currentUser.getUserId())));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal SmartQuizUserDetails currentUser) {
        notificationService.markRead(currentUser.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal SmartQuizUserDetails currentUser) {
        notificationService.markAllRead(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
