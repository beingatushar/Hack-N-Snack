package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StackRequest(

        @NotBlank(message = "Stack name is required")
        @Size(max = 200, message = "Stack name must not exceed 200 characters")
        String stackName,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description
) {}
