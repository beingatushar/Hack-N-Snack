package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.McqStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "Decision is required")
    private McqStatus decision;

    private String comments;
}
