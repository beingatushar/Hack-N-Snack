package com.accenture.smartquiz.controller;

import com.accenture.smartquiz.dto.request.AiGenerateRequest;
import com.accenture.smartquiz.dto.response.*;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.AdminService;
import com.accenture.smartquiz.service.AiQuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final AdminService adminService;
    private final AiQuestionService aiQuestionService;

    @GetMapping("/smes")
    @Operation(summary = "Get all active SME users with their stats")
    public ResponseEntity<ApiResponse<List<SmeUserResponse>>> getAllSmes() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllSmes()));
    }

    @GetMapping("/stacks/{stackId}/smes")
    @Operation(summary = "Get eligible reviewers for a given stack (stack SMEs + all admins)")
    public ResponseEntity<ApiResponse<List<SmeUserResponse>>> getSmesByStack(@PathVariable Long stackId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSmesByStack(stackId)));
    }

    @PostMapping("/ai/generate")
    @Operation(summary = "Generate MCQ questions using AI (saved as DRAFT)")
    public ResponseEntity<ApiResponse<List<McqResponse>>> generateQuestions(
            @Valid @RequestBody AiGenerateRequest request,
            @AuthenticationPrincipal SmartQuizUserDetails currentUser) {
        List<McqResponse> questions = aiQuestionService.generateQuestions(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(
                "Generated " + questions.size() + " question(s) as DRAFT", questions));
    }
}
