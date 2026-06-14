package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.McqStatus;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(

        @NotNull(message = "Decision is required")
        McqStatus decision,

        String comments
) {}
