package com.accenture.smartquiz.dto.response;

import com.accenture.smartquiz.entity.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String enterpriseId;
    private String fullName;
    private String email;
    private UserRole role;
    private long expiresIn;
}
