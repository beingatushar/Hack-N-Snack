package com.accenture.smartquiz.dto.response;

import com.accenture.smartquiz.entity.enums.Difficulty;
import com.accenture.smartquiz.entity.enums.McqStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class McqResponse {

    private Long id;
    private String questionStem;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private Difficulty difficulty;
    private Long stackId;
    private String stackName;
    private Long topicId;
    private String topicName;
    private McqStatus status;
    private Long creatorId;
    private String creatorName;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerComments;
    private BigDecimal aiSimilarityScore;
    private Instant createdAt;
    private Instant updatedAt;
}
