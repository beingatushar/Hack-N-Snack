package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TopicResponse {

    private Long id;
    private Long stackId;
    private String stackName;
    private String topicName;
}
