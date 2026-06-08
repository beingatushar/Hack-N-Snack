package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TopicRequest {

    @NotBlank(message = "Topic name is required")
    @Size(max = 300, message = "Topic name must not exceed 300 characters")
    private String topicName;
}
