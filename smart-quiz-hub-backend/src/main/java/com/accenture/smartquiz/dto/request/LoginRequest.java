package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Enterprise ID is required")
    @Size(max = 100, message = "Enterprise ID is too long")
    private String enterpriseId;

    @NotBlank(message = "Password is required")
    @Size(max = 200, message = "Password is too long")
    private String password;
}
