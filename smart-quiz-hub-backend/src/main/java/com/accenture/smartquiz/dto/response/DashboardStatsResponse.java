package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {

    private long totalQuestions;
    private long draftCount;
    private long readyForReviewCount;
    private long underReviewCount;
    private long approvedCount;
    private long rejectedCount;
    private long pendingReviewCount;
}
