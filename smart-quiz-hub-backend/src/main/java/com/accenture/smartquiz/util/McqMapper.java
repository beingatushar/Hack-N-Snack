package com.accenture.smartquiz.util;

import com.accenture.smartquiz.dto.response.McqResponse;
import com.accenture.smartquiz.entity.McqQuestion;

public final class McqMapper {

    private McqMapper() {}

    public static McqResponse toResponse(McqQuestion q) {
        return McqResponse.builder()
                .id(q.getId())
                .questionStem(q.getQuestionStem())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .difficulty(q.getDifficulty())
                .stackId(q.getStack().getId())
                .stackName(q.getStack().getStackName())
                .topicId(q.getTopic().getId())
                .topicName(q.getTopic().getTopicName())
                .status(q.getStatus())
                .creatorId(q.getCreator().getId())
                .creatorName(q.getCreator().getFullName())
                .reviewerId(q.getReviewer() != null ? q.getReviewer().getId() : null)
                .reviewerName(q.getReviewer() != null ? q.getReviewer().getFullName() : null)
                .reviewerComments(q.getReviewerComments())
                .aiSimilarityScore(q.getAiSimilarityScore())
                .createdAt(q.getCreatedAt())
                .updatedAt(q.getUpdatedAt())
                .build();
    }
}
