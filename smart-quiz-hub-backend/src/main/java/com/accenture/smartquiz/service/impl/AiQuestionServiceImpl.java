package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.request.AiGenerateRequest;
import com.accenture.smartquiz.dto.response.McqResponse;
import com.accenture.smartquiz.entity.McqQuestion;
import com.accenture.smartquiz.entity.TechnologyStack;
import com.accenture.smartquiz.entity.Topic;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.McqStatus;
import com.accenture.smartquiz.exception.ResourceNotFoundException;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import com.accenture.smartquiz.repository.TechnologyStackRepository;
import com.accenture.smartquiz.repository.TopicRepository;
import com.accenture.smartquiz.repository.UserRepository;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.AiQuestionService;
import com.accenture.smartquiz.util.McqMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiQuestionServiceImpl implements AiQuestionService {

    private final ChatClient.Builder chatClientBuilder;
    private final McqQuestionRepository mcqRepo;
    private final TechnologyStackRepository stackRepo;
    private final TopicRepository topicRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public List<McqResponse> generateQuestions(AiGenerateRequest request, SmartQuizUserDetails currentUser) {
        TechnologyStack stack = stackRepo.findById(request.getStackId())
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", request.getStackId()));
        Topic topic = topicRepo.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", request.getTopicId()));
        User creator = userRepo.getReferenceById(currentUser.getUserId());

        String prompt = buildPrompt(stack.getStackName(), topic.getTopicName(),
                request.getDifficulty().name(), request.getTopicContext(), request.getCount());

        List<Map<String, Object>> parsed = callAi(prompt);
        List<McqResponse> results = new ArrayList<>();

        for (Map<String, Object> q : parsed) {
            try {
                McqQuestion question = McqQuestion.builder()
                        .questionStem((String) q.get("question"))
                        .optionA((String) q.get("optionA"))
                        .optionB((String) q.get("optionB"))
                        .optionC((String) q.get("optionC"))
                        .optionD((String) q.get("optionD"))
                        .correctOption(((String) q.get("correctOption")).toUpperCase())
                        .difficulty(request.getDifficulty())
                        .stack(stack)
                        .topic(topic)
                        .creator(creator)
                        .status(McqStatus.DRAFT)
                        .build();
                results.add(McqMapper.toResponse(mcqRepo.save(question)));
            } catch (Exception e) {
                log.warn("Failed to persist AI-generated question: {}", e.getMessage());
            }
        }

        return results;
    }

    private String buildPrompt(String stack, String topic, String difficulty,
                                String context, int count) {
        return """
                You are an expert Java/Spring educator creating MCQ questions for technical assessments.

                Generate exactly %d MCQ questions about "%s" in the context of "%s" technology stack.
                Difficulty: %s
                Additional context: %s

                Rules:
                - Each question must be scenario-based (start with a developer name and a real-world situation)
                - Options must be plausible and educational
                - Only one correct answer per question

                Respond ONLY with a valid JSON array. No extra text. Format:
                [
                  {
                    "question": "...",
                    "optionA": "...",
                    "optionB": "...",
                    "optionC": "...",
                    "optionD": "...",
                    "correctOption": "A|B|C|D"
                  }
                ]
                """.formatted(count, topic, stack, difficulty, context);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> callAi(String prompt) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String json = extractJson(response);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("AI question generation failed: {}", e.getMessage());
            return List.of();
        }
    }

    private String extractJson(String text) {
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');
        if (start == -1 || end == -1) return "[]";
        return text.substring(start, end + 1);
    }
}
