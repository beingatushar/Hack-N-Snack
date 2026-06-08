package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StackSummaryResponse {

    private Long id;
    private String stackName;
}
