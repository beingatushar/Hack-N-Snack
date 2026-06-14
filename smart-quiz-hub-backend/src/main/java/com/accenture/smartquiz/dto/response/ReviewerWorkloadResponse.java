package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewerWorkloadResponse {
    private String reviewerName;
    private long pendingCount;
}
