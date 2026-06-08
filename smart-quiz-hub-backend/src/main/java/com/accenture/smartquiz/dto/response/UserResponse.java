package com.accenture.smartquiz.dto.response;

import com.accenture.smartquiz.entity.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String enterpriseId;
    private String fullName;
    private String email;
    private UserRole role;
    private boolean active;
    private List<StackSummaryResponse> stacks;
    private Instant createdAt;
}
