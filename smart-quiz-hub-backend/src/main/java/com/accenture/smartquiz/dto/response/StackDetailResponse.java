package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StackDetailResponse {

    private Long id;
    private String stackName;
    private String description;
    private boolean active;
    private List<TopicDetailResponse> topics;
}
