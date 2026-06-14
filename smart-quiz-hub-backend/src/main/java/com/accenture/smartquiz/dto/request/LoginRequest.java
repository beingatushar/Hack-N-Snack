package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Enterprise ID is required")
        @Size(max = 100, message = "Enterprise ID is too long")
        String enterpriseId,

        @NotBlank(message = "Password is required")
        @Size(max = 200, message = "Password is too long")
        String password
) {}
