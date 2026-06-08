package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.Difficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AiGenerateRequest {

    @NotNull(message = "Stack ID is required")
    private Long stackId;

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotBlank(message = "Topic context is required")
    private String topicContext;

    @Min(1) @Max(10)
    private int count = 3;
}
