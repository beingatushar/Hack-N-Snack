package com.accenture.smartquiz.dto.request;

import com.accenture.smartquiz.entity.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class McqRequest {

    @NotBlank(message = "Question stem is required")
    @Size(min = 20, max = 2000, message = "Question must be between 20 and 2000 characters")
    private String questionStem;

    @NotBlank(message = "Option A is required")
    @Size(max = 1000)
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Size(max = 1000)
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Size(max = 1000)
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Size(max = 1000)
    private String optionD;

    @NotBlank(message = "Correct option is required")
    @Pattern(regexp = "^[ABCDabcd]$", message = "Correct option must be A, B, C, or D")
    private String correctOption;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotNull(message = "Stack ID is required")
    private Long stackId;

    @NotNull(message = "Topic ID is required")
    private Long topicId;
}
