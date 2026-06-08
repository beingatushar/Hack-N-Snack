package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StackRequest {

    @NotBlank(message = "Stack name is required")
    @Size(max = 200, message = "Stack name must not exceed 200 characters")
    private String stackName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}
