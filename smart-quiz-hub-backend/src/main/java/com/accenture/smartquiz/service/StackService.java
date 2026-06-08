package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.request.StackRequest;
import com.accenture.smartquiz.dto.request.TopicRequest;
import com.accenture.smartquiz.dto.response.StackDetailResponse;
import com.accenture.smartquiz.dto.response.StackSummaryResponse;
import com.accenture.smartquiz.dto.response.TopicDetailResponse;
import com.accenture.smartquiz.dto.response.TopicResponse;

import java.util.List;

public interface StackService {

    List<StackSummaryResponse> getAllActiveStacks();

    List<TopicResponse> getTopicsByStack(Long stackId);

    // Admin CRUD
    List<StackDetailResponse> getAllStacksAdmin();

    StackDetailResponse createStack(StackRequest request);

    StackDetailResponse updateStack(Long id, StackRequest request);

    StackDetailResponse toggleStack(Long id);

    TopicDetailResponse addTopic(Long stackId, TopicRequest request);

    TopicDetailResponse updateTopic(Long stackId, Long topicId, TopicRequest request);

    TopicDetailResponse toggleTopic(Long stackId, Long topicId);
}
