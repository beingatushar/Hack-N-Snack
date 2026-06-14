package com.accenture.smartquiz.controller;

import com.accenture.smartquiz.dto.response.AnalyticsOverviewResponse;
import com.accenture.smartquiz.dto.response.ApiResponse;
import com.accenture.smartquiz.dto.response.ReviewerWorkloadResponse;
import com.accenture.smartquiz.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Analytics", description = "System-wide question and reviewer analytics (Admin only)")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Overview: questions by status / stack / difficulty + 12-week creation trend")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> overview() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverview()));
    }

    @GetMapping("/reviewer-workload")
    @Operation(summary = "Pending question count per reviewer (sorted by load, desc)")
    public ResponseEntity<ApiResponse<List<ReviewerWorkloadResponse>>> reviewerWorkload() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getReviewerWorkload()));
    }
}
