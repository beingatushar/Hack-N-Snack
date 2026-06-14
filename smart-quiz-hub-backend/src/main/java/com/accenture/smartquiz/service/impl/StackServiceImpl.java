package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.request.StackRequest;
import com.accenture.smartquiz.dto.request.TopicRequest;
import com.accenture.smartquiz.dto.response.StackDetailResponse;
import com.accenture.smartquiz.dto.response.StackSummaryResponse;
import com.accenture.smartquiz.dto.response.TopicDetailResponse;
import com.accenture.smartquiz.dto.response.TopicResponse;
import com.accenture.smartquiz.entity.TechnologyStack;
import com.accenture.smartquiz.entity.Topic;
import com.accenture.smartquiz.exception.ResourceNotFoundException;
import com.accenture.smartquiz.repository.TechnologyStackRepository;
import com.accenture.smartquiz.repository.TopicRepository;
import com.accenture.smartquiz.service.StackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StackServiceImpl implements StackService {

    private final TechnologyStackRepository stackRepository;
    private final TopicRepository topicRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StackSummaryResponse> getAllActiveStacks() {
        return stackRepository.findByActiveTrue().stream()
                .map(this::toStackSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsByStack(Long stackId) {
        TechnologyStack stack = stackRepository.findById(stackId)
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", stackId));
        return topicRepository.findByStackIdAndActiveTrue(stackId).stream()
                .map(t -> toTopicResponse(t, stack))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StackDetailResponse> getAllStacksAdmin() {
        return stackRepository.findAll().stream()
                .map(this::toStackDetail)
                .toList();
    }

    @Override
    @Transactional
    public StackDetailResponse createStack(StackRequest request) {
        if (stackRepository.existsByStackNameIgnoreCase(request.stackName())) {
            throw new IllegalArgumentException("Stack '" + request.stackName() + "' already exists");
        }
        TechnologyStack stack = TechnologyStack.builder()
                .stackName(request.stackName())
                .description(request.description())
                .active(true)
                .build();
        return toStackDetail(stackRepository.save(stack));
    }

    @Override
    @Transactional
    public StackDetailResponse updateStack(Long id, StackRequest request) {
        TechnologyStack stack = stackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", id));
        boolean nameChanged = !stack.getStackName().equalsIgnoreCase(request.stackName());
        if (nameChanged && stackRepository.existsByStackNameIgnoreCase(request.stackName())) {
            throw new IllegalArgumentException("Stack '" + request.stackName() + "' already exists");
        }
        stack.setStackName(request.stackName());
        stack.setDescription(request.description());
        return toStackDetail(stackRepository.save(stack));
    }

    @Override
    @Transactional
    public StackDetailResponse toggleStack(Long id) {
        TechnologyStack stack = stackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", id));
        stack.setActive(!stack.isActive());
        return toStackDetail(stackRepository.save(stack));
    }

    @Override
    @Transactional
    public TopicDetailResponse addTopic(Long stackId, TopicRequest request) {
        TechnologyStack stack = stackRepository.findById(stackId)
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", stackId));
        if (topicRepository.existsByStackIdAndTopicNameIgnoreCase(stackId, request.topicName())) {
            throw new IllegalArgumentException("Topic '" + request.topicName() + "' already exists in this stack");
        }
        Topic topic = Topic.builder()
                .stack(stack)
                .topicName(request.topicName())
                .active(true)
                .build();
        return toTopicDetail(topicRepository.save(topic));
    }

    @Override
    @Transactional
    public TopicDetailResponse updateTopic(Long stackId, Long topicId, TopicRequest request) {
        if (!stackRepository.existsById(stackId)) {
            throw new ResourceNotFoundException("TechnologyStack", stackId);
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));
        boolean nameChanged = !topic.getTopicName().equalsIgnoreCase(request.topicName());
        if (nameChanged && topicRepository.existsByStackIdAndTopicNameIgnoreCase(stackId, request.topicName())) {
            throw new IllegalArgumentException("Topic '" + request.topicName() + "' already exists in this stack");
        }
        topic.setTopicName(request.topicName());
        return toTopicDetail(topicRepository.save(topic));
    }

    @Override
    @Transactional
    public TopicDetailResponse toggleTopic(Long stackId, Long topicId) {
        if (!stackRepository.existsById(stackId)) {
            throw new ResourceNotFoundException("TechnologyStack", stackId);
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));
        topic.setActive(!topic.isActive());
        return toTopicDetail(topicRepository.save(topic));
    }

    private StackSummaryResponse toStackSummary(TechnologyStack stack) {
        return StackSummaryResponse.builder()
                .id(stack.getId())
                .stackName(stack.getStackName())
                .build();
    }

    private StackDetailResponse toStackDetail(TechnologyStack stack) {
        List<TopicDetailResponse> topics = topicRepository.findByStackId(stack.getId()).stream()
                .map(this::toTopicDetail)
                .toList();
        return StackDetailResponse.builder()
                .id(stack.getId())
                .stackName(stack.getStackName())
                .description(stack.getDescription())
                .active(stack.isActive())
                .topics(topics)
                .build();
    }

    private TopicDetailResponse toTopicDetail(Topic topic) {
        return TopicDetailResponse.builder()
                .id(topic.getId())
                .topicName(topic.getTopicName())
                .active(topic.isActive())
                .build();
    }

    private TopicResponse toTopicResponse(Topic topic, TechnologyStack stack) {
        return TopicResponse.builder()
                .id(topic.getId())
                .stackId(stack.getId())
                .stackName(stack.getStackName())
                .topicName(topic.getTopicName())
                .build();
    }
}
