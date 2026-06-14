package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.Difficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiGenerateRequest(

        @NotNull(message = "Stack ID is required")
        Long stackId,

        @NotNull(message = "Topic ID is required")
        Long topicId,

        @NotNull(message = "Difficulty is required")
        Difficulty difficulty,

        @NotBlank(message = "Topic context is required")
        String topicContext,

        @Min(1) @Max(10)
        int count
) {
    /** Preserve the previous default of 3 when the client omits {@code count}. */
    public AiGenerateRequest {
        if (count == 0) count = 3;
    }
}
