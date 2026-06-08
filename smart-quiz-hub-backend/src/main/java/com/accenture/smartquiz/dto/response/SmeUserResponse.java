package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SmeUserResponse {

    private Long id;
    private String enterpriseId;
    private String fullName;
    private String email;
    private boolean active;
    private List<StackSummaryResponse> stacks;
    private long totalQuestions;
    private long approvedQuestions;
}
