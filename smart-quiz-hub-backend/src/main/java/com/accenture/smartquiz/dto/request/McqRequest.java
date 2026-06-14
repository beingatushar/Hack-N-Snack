package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.Difficulty;
import jakarta.validation.constraints.*;

import java.util.List;

public record McqRequest(

        @NotBlank(message = "Question stem is required")
        @Size(min = 20, max = 2000, message = "Question must be between 20 and 2000 characters")
        String questionStem,

        @NotNull(message = "Options list is required")
        @Size(min = 4, message = "At least 4 options are required")
        List<@NotBlank(message = "Option text must not be blank") @Size(max = 1000) String> options,

        @NotNull(message = "Correct option indices are required")
        @Size(min = 1, message = "At least one correct option must be selected")
        List<@NotNull @Min(0) Integer> correctOptionIndices,

        @NotNull(message = "Difficulty is required")
        Difficulty difficulty,

        @NotNull(message = "Stack ID is required")
        Long stackId,

        @NotNull(message = "Topic ID is required")
        Long topicId
) {
    @AssertTrue(message = "Correct option indices must be within the range of provided options")
    public boolean isCorrectIndicesValid() {
        if (options == null || correctOptionIndices == null) return true;
        return correctOptionIndices.stream().allMatch(i -> i != null && i >= 0 && i < options.size());
    }
}
