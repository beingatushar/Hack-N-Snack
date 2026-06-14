package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignReviewerRequest(

        @NotNull(message = "Reviewer ID is required")
        Long reviewerId
) {}
