package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.request.AssignReviewerRequest;
import com.accenture.smartquiz.dto.request.BulkAssignRequest;
import com.accenture.smartquiz.dto.request.ReviewRequest;
import com.accenture.smartquiz.dto.response.BulkAssignResponse;
import com.accenture.smartquiz.dto.response.McqResponse;
import com.accenture.smartquiz.dto.response.PagedResponse;
import com.accenture.smartquiz.entity.McqQuestion;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.McqStatus;
import com.accenture.smartquiz.entity.enums.UserRole;
import com.accenture.smartquiz.exception.InvalidStatusTransitionException;
import com.accenture.smartquiz.exception.ResourceNotFoundException;
import com.accenture.smartquiz.exception.UnauthorizedAccessException;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import com.accenture.smartquiz.repository.UserRepository;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.ReviewService;
import com.accenture.smartquiz.util.McqMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final McqQuestionRepository mcqRepo;
    private final UserRepository userRepo;

    @Override
    @Transactional
    public McqResponse assignReviewer(Long questionId, AssignReviewerRequest request,
                                       SmartQuizUserDetails currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can assign reviewers");
        }

        McqQuestion question = findById(questionId);

        if (question.getStatus() != McqStatus.READY_FOR_REVIEW
                && question.getStatus() != McqStatus.UNDER_REVIEW) {
            throw new InvalidStatusTransitionException(
                    "Reviewer can only be assigned to questions in READY_FOR_REVIEW or UNDER_REVIEW status");
        }

        User reviewer = userRepo.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getReviewerId()));

        if (reviewer.getId().equals(question.getCreator().getId())) {
            throw new UnauthorizedAccessException("Creator cannot review their own question");
        }

        question.setReviewer(reviewer);
        // Keep UNDER_REVIEW as-is on reassign; promote READY_FOR_REVIEW to UNDER_REVIEW
        if (question.getStatus() == McqStatus.READY_FOR_REVIEW) {
            question.setStatus(McqStatus.UNDER_REVIEW);
        }
        question.setReviewerComments(null);

        log.info("Question {} assigned to reviewer {} by admin {}", questionId,
                reviewer.getId(), currentUser.getUserId());

        return McqMapper.toResponse(mcqRepo.save(question));
    }

    @Override
    @Transactional
    public BulkAssignResponse bulkAssignReviewer(BulkAssignRequest request, SmartQuizUserDetails currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can assign reviewers");
        }

        User reviewer = userRepo.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getReviewerId()));

        int assigned = 0;
        List<String> skippedReasons = new ArrayList<>();

        for (Long questionId : request.getQuestionIds()) {
            McqQuestion question = mcqRepo.findById(questionId).orElse(null);
            if (question == null) {
                skippedReasons.add("Question " + questionId + ": not found");
                continue;
            }
            if (question.getStatus() != McqStatus.READY_FOR_REVIEW
                    && question.getStatus() != McqStatus.UNDER_REVIEW) {
                skippedReasons.add("Question " + questionId + ": status is " + question.getStatus());
                continue;
            }
            if (reviewer.getId().equals(question.getCreator().getId())) {
                skippedReasons.add("Question " + questionId + ": reviewer is the creator");
                continue;
            }
            question.setReviewer(reviewer);
            if (question.getStatus() == McqStatus.READY_FOR_REVIEW) {
                question.setStatus(McqStatus.UNDER_REVIEW);
            }
            question.setReviewerComments(null);
            mcqRepo.save(question);
            assigned++;
        }

        log.info("Bulk assign: {} assigned, {} skipped by admin {}", assigned, skippedReasons.size(), currentUser.getUserId());

        return BulkAssignResponse.builder()
                .assigned(assigned)
                .skipped(skippedReasons.size())
                .skippedReasons(skippedReasons)
                .build();
    }

    @Override
    @Transactional
    public McqResponse startReview(Long questionId, SmartQuizUserDetails currentUser) {
        McqQuestion question = findById(questionId);

        if (!question.getReviewer().getId().equals(currentUser.getUserId())) {
            throw new UnauthorizedAccessException("You are not the assigned reviewer for this question");
        }
        if (question.getStatus() != McqStatus.READY_FOR_REVIEW) {
            throw new InvalidStatusTransitionException(question.getStatus(), McqStatus.UNDER_REVIEW);
        }

        question.setStatus(McqStatus.UNDER_REVIEW);
        return McqMapper.toResponse(mcqRepo.save(question));
    }

    @Override
    @Transactional
    public McqResponse submitReview(Long questionId, ReviewRequest request,
                                     SmartQuizUserDetails currentUser) {
        McqQuestion question = findById(questionId);

        if (!question.getReviewer().getId().equals(currentUser.getUserId())) {
            throw new UnauthorizedAccessException("You are not the assigned reviewer for this question");
        }
        if (question.getStatus() != McqStatus.UNDER_REVIEW
                && question.getStatus() != McqStatus.READY_FOR_REVIEW) {
            throw new InvalidStatusTransitionException(
                    "Question must be UNDER_REVIEW or READY_FOR_REVIEW to submit a review decision");
        }
        if (question.getStatus() == McqStatus.READY_FOR_REVIEW) {
            question.setStatus(McqStatus.UNDER_REVIEW);
        }

        McqStatus decision = request.getDecision();
        if (decision != McqStatus.APPROVED && decision != McqStatus.REJECTED) {
            throw new InvalidStatusTransitionException("Review decision must be APPROVED or REJECTED");
        }
        if (decision == McqStatus.REJECTED &&
                (request.getComments() == null || request.getComments().isBlank())) {
            throw new IllegalArgumentException("Comments are mandatory when rejecting a question");
        }

        question.setStatus(decision);
        question.setReviewerComments(request.getComments());

        log.info("Question {} {} by reviewer {}", questionId, decision,
                currentUser.getEnterpriseId());

        return McqMapper.toResponse(mcqRepo.save(question));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<McqResponse> getPendingReviews(SmartQuizUserDetails currentUser, Pageable pageable) {
        var statuses = List.of(McqStatus.READY_FOR_REVIEW, McqStatus.UNDER_REVIEW);
        var page = mcqRepo.findByReviewerIdAndStatusIn(currentUser.getUserId(), statuses, pageable);
        return PagedResponse.of(page.map(McqMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<McqResponse> getReadyForReview(SmartQuizUserDetails currentUser, Pageable pageable) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return PagedResponse.of(mcqRepo.findByStatus(McqStatus.READY_FOR_REVIEW, pageable)
                    .map(McqMapper::toResponse));
        }
        return PagedResponse.of(mcqRepo.findByReviewerIdAndStatus(
                currentUser.getUserId(), McqStatus.READY_FOR_REVIEW, pageable)
                .map(McqMapper::toResponse));
    }

    private McqQuestion findById(Long id) {
        return mcqRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("McqQuestion", id));
    }
}
