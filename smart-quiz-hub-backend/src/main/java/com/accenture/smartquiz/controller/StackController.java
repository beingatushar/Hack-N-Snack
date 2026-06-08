package com.accenture.smartquiz.controller;

import com.accenture.smartquiz.dto.request.StackRequest;
import com.accenture.smartquiz.dto.request.TopicRequest;
import com.accenture.smartquiz.dto.response.ApiResponse;
import com.accenture.smartquiz.dto.response.StackDetailResponse;
import com.accenture.smartquiz.dto.response.StackSummaryResponse;
import com.accenture.smartquiz.dto.response.TopicDetailResponse;
import com.accenture.smartquiz.dto.response.TopicResponse;
import com.accenture.smartquiz.service.StackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stacks")
@RequiredArgsConstructor
@Tag(name = "Stacks & Topics", description = "Technology stacks and topics reference data")
public class StackController {

    private final StackService stackService;

    @GetMapping
    @Operation(summary = "Get all active technology stacks")
    public ResponseEntity<ApiResponse<List<StackSummaryResponse>>> getAllStacks() {
        return ResponseEntity.ok(ApiResponse.success(stackService.getAllActiveStacks()));
    }

    @GetMapping("/{stackId}/topics")
    @Operation(summary = "Get all active topics for a stack")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopics(@PathVariable Long stackId) {
        return ResponseEntity.ok(ApiResponse.success(stackService.getTopicsByStack(stackId)));
    }

    // ─── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Get all stacks including inactive")
    public ResponseEntity<ApiResponse<List<StackDetailResponse>>> getAllStacksAdmin() {
        return ResponseEntity.ok(ApiResponse.success(stackService.getAllStacksAdmin()));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new technology stack")
    public ResponseEntity<ApiResponse<StackDetailResponse>> createStack(@Valid @RequestBody StackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stackService.createStack(request)));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Update a technology stack")
    public ResponseEntity<ApiResponse<StackDetailResponse>> updateStack(
            @PathVariable Long id,
            @Valid @RequestBody StackRequest request) {
        return ResponseEntity.ok(ApiResponse.success(stackService.updateStack(id, request)));
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Toggle stack active/inactive")
    public ResponseEntity<ApiResponse<StackDetailResponse>> toggleStack(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(stackService.toggleStack(id)));
    }

    @PostMapping("/admin/{stackId}/topics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Add a topic to a stack")
    public ResponseEntity<ApiResponse<TopicDetailResponse>> addTopic(
            @PathVariable Long stackId,
            @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stackService.addTopic(stackId, request)));
    }

    @PutMapping("/admin/{stackId}/topics/{topicId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Update a topic")
    public ResponseEntity<ApiResponse<TopicDetailResponse>> updateTopic(
            @PathVariable Long stackId,
            @PathVariable Long topicId,
            @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(ApiResponse.success(stackService.updateTopic(stackId, topicId, request)));
    }

    @PatchMapping("/admin/{stackId}/topics/{topicId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Toggle topic active/inactive")
    public ResponseEntity<ApiResponse<TopicDetailResponse>> toggleTopic(
            @PathVariable Long stackId,
            @PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(stackService.toggleTopic(stackId, topicId)));
    }
}
