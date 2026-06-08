package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.request.AiGenerateRequest;
import com.accenture.smartquiz.dto.response.McqResponse;
import com.accenture.smartquiz.security.SmartQuizUserDetails;

import java.util.List;

public interface AiQuestionService {

    List<McqResponse> generateQuestions(AiGenerateRequest request, SmartQuizUserDetails currentUser);
}
