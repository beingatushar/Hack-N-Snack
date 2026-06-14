package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.response.AnalyticsOverviewResponse;
import com.accenture.smartquiz.dto.response.ReviewerWorkloadResponse;

import java.util.List;

public interface AnalyticsService {

    AnalyticsOverviewResponse getOverview();

    List<ReviewerWorkloadResponse> getReviewerWorkload();
}
