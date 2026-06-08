package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TopicDetailResponse {

    private Long id;
    private String topicName;
    private boolean active;
}
