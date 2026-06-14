package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Payload for the AI-driven duplicate / similarity check performed on the
 * Edit page (Level 2). The candidate question does not need to be persisted —
 * similarity is computed against existing questions in the same stack + topic.
 *
 * @param excludeId when editing an existing question, exclude it from the comparison.
 */
public record DuplicateCheckRequest(

        @NotNull(message = "Stack ID is required")
        Long stackId,

        @NotNull(message = "Topic ID is required")
        Long topicId,

        @NotBlank(message = "Question stem is required")
        String questionStem,

        @NotNull(message = "Options list is required")
        @Size(min = 4, message = "At least 4 options are required")
        List<@NotBlank String> options,

        Long excludeId
) {}
