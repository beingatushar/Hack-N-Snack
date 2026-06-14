package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.request.DuplicateCheckRequest;
import com.accenture.smartquiz.dto.request.McqRequest;
import com.accenture.smartquiz.dto.response.BulkUploadResponse;
import com.accenture.smartquiz.dto.response.DashboardStatsResponse;
import com.accenture.smartquiz.dto.response.DuplicateCheckResponse;
import com.accenture.smartquiz.dto.response.McqResponse;
import com.accenture.smartquiz.dto.response.PagedResponse;
import com.accenture.smartquiz.dto.response.SimilarQuestionResponse;
import com.accenture.smartquiz.entity.McqQuestion;
import com.accenture.smartquiz.entity.TechnologyStack;
import com.accenture.smartquiz.entity.Topic;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.Difficulty;
import com.accenture.smartquiz.entity.enums.McqStatus;
import com.accenture.smartquiz.entity.enums.UserRole;
import com.accenture.smartquiz.exception.DuplicateQuestionException;
import com.accenture.smartquiz.exception.InvalidStatusTransitionException;
import com.accenture.smartquiz.exception.ResourceNotFoundException;
import com.accenture.smartquiz.exception.UnauthorizedAccessException;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import com.accenture.smartquiz.repository.TechnologyStackRepository;
import com.accenture.smartquiz.repository.TopicRepository;
import com.accenture.smartquiz.repository.UserRepository;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.McqService;
import com.accenture.smartquiz.service.SimilarityOutcome;
import com.accenture.smartquiz.service.SimilarityService;
import com.accenture.smartquiz.util.McqMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class McqServiceImpl implements McqService {

    private final McqQuestionRepository mcqRepo;
    private final TechnologyStackRepository stackRepo;
    private final TopicRepository topicRepo;
    private final UserRepository userRepo;
    private final SimilarityService similarityService;

    @Override
    @Transactional
    public McqResponse createQuestion(McqRequest req, SmartQuizUserDetails currentUser) {
        TechnologyStack stack = stackRepo.findById(req.stackId())
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", req.stackId()));
        Topic topic = topicRepo.findById(req.topicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", req.topicId()));
        User creator = userRepo.getReferenceById(currentUser.getUserId());

        McqQuestion question = McqQuestion.builder()
                .questionStem(req.questionStem())
                .options(req.options())
                .correctOptionIndices(req.correctOptionIndices())
                .difficulty(req.difficulty())
                .stack(stack)
                .topic(topic)
                .creator(creator)
                .status(McqStatus.DRAFT)
                .build();

        return McqMapper.toResponse(mcqRepo.save(question));
    }

    @Override
    @Transactional
    public McqResponse updateQuestion(Long id, McqRequest req, SmartQuizUserDetails currentUser) {
        McqQuestion question = findQuestionById(id);
        assertCanEdit(question, currentUser);

        TechnologyStack stack = stackRepo.findById(req.stackId())
                .orElseThrow(() -> new ResourceNotFoundException("TechnologyStack", req.stackId()));
        Topic topic = topicRepo.findById(req.topicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", req.topicId()));

        question.setQuestionStem(req.questionStem());
        question.setOptions(req.options());
        question.setCorrectOptionIndices(req.correctOptionIndices());
        question.setDifficulty(req.difficulty());
        question.setStack(stack);
        question.setTopic(topic);

        return McqMapper.toResponse(mcqRepo.save(question));
    }

    @Override
    @Transactional(readOnly = true)
    public McqResponse getQuestion(Long id, SmartQuizUserDetails currentUser) {
        McqQuestion question = findQuestionById(id);
        assertCanView(question, currentUser);
        return McqMapper.toResponse(question);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<McqResponse> getMyQuestions(McqStatus status, SmartQuizUserDetails currentUser, Pageable pageable) {
        Page<McqQuestion> page = status != null
                ? mcqRepo.findByCreatorIdAndStatus(currentUser.getUserId(), status, pageable)
                : mcqRepo.findByCreatorId(currentUser.getUserId(), pageable);
        return PagedResponse.of(page.map(McqMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<McqResponse> getAllQuestions(McqStatus status, Long stackId, Difficulty difficulty,
                                                       SmartQuizUserDetails currentUser, Pageable pageable) {
        Specification<McqQuestion> spec = buildSpec(status, stackId, difficulty, currentUser);
        Page<McqQuestion> page = mcqRepo.findAll(spec, pageable);
        return PagedResponse.of(page.map(McqMapper::toResponse));
    }

    @Override
    @Transactional
    public McqResponse submitForReview(Long id, SmartQuizUserDetails currentUser) {
        McqQuestion question = findQuestionById(id);

        if (!question.getCreator().getId().equals(currentUser.getUserId())) {
            throw new UnauthorizedAccessException("Only the creator can submit a question for review");
        }
        if (!question.getStatus().canTransitionTo(McqStatus.READY_FOR_REVIEW)) {
            throw new InvalidStatusTransitionException(question.getStatus(), McqStatus.READY_FOR_REVIEW);
        }

        // Level 2: a question may only be sent for review if it is below the
        // similarity threshold. The same check also backs the "Duplicate Check"
        // button on the Edit page.
        enforceNotDuplicate(question);

        question.setStatus(McqStatus.READY_FOR_REVIEW);
        question.setSubmittedAt(java.time.Instant.now());
        return McqMapper.toResponse(mcqRepo.save(question));
    }

    /**
     * Runs the similarity engine for a persisted question (excluding itself).
     * Persists the resulting score and throws {@link DuplicateQuestionException}
     * with the offending matches when the threshold is reached.
     */
    private void enforceNotDuplicate(McqQuestion question) {
        SimilarityOutcome outcome = similarityService.analyze(
                question.getStack().getId(), question.getTopic().getId(),
                question.getQuestionStem(), question.getOptions(), question.getId());

        double threshold = similarityService.threshold();
        question.setAiSimilarityScore(
                BigDecimal.valueOf(outcome.maxScore()).setScale(4, RoundingMode.HALF_UP));

        if (outcome.maxScore() < threshold) {
            return;
        }

        int thresholdPercent = (int) Math.round(threshold * 100);
        double maxPercent = McqMapper.toPercent(outcome.maxScore());

        List<SimilarQuestionResponse> similar = outcome.matchesAtOrAbove(threshold).stream()
                .map(m -> McqMapper.toSimilarResponse(m.question(), m.score()))
                .toList();

        String topMatch = similar.isEmpty() ? "" :
                " Most similar: \"" + truncate(similar.get(0).getQuestionStem(), 80) + "\".";

        String message = String.format(
                "This question is %.1f%% similar to an existing question (threshold %d%%). "
                        + "Please revise it and re-run the duplicate check before sending for review.%s",
                maxPercent, thresholdPercent, topMatch);

        throw new DuplicateQuestionException(message, maxPercent, thresholdPercent, similar);
    }

    private String truncate(String text, int max) {
        if (text == null) {
            return "";
        }
        return text.length() > max ? text.substring(0, max) + "..." : text;
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id, SmartQuizUserDetails currentUser) {
        McqQuestion question = findQuestionById(id);

        boolean isCreator = question.getCreator().getId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        boolean creatorDeletable = isCreator &&
                (question.getStatus() == McqStatus.DRAFT ||
                 question.getStatus() == McqStatus.READY_FOR_REVIEW);

        if (!creatorDeletable && !isAdmin) {
            throw new UnauthorizedAccessException(
                "You can only delete your own questions in DRAFT or READY FOR REVIEW status");
        }

        mcqRepo.delete(question);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(SmartQuizUserDetails currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return DashboardStatsResponse.builder()
                    .totalQuestions(mcqRepo.count())
                    .draftCount(mcqRepo.countByStatus(McqStatus.DRAFT))
                    .readyForReviewCount(mcqRepo.countByStatus(McqStatus.READY_FOR_REVIEW))
                    .underReviewCount(mcqRepo.countByStatus(McqStatus.UNDER_REVIEW))
                    .approvedCount(mcqRepo.countByStatus(McqStatus.APPROVED))
                    .rejectedCount(mcqRepo.countByStatus(McqStatus.REJECTED))
                    .build();
        }

        Long uid = currentUser.getUserId();
        return DashboardStatsResponse.builder()
                .totalQuestions(mcqRepo.countByCreatorId(uid))
                .draftCount(mcqRepo.countByCreatorIdAndStatus(uid, McqStatus.DRAFT))
                .readyForReviewCount(mcqRepo.countByCreatorIdAndStatus(uid, McqStatus.READY_FOR_REVIEW))
                .underReviewCount(mcqRepo.countByCreatorIdAndStatus(uid, McqStatus.UNDER_REVIEW))
                .approvedCount(mcqRepo.countByCreatorIdAndStatus(uid, McqStatus.APPROVED))
                .rejectedCount(mcqRepo.countByCreatorIdAndStatus(uid, McqStatus.REJECTED))
                .pendingReviewCount(mcqRepo.countByReviewerIdAndStatus(uid, McqStatus.UNDER_REVIEW))
                .build();
    }

    @Override
    @Transactional
    public BulkUploadResponse bulkUpload(MultipartFile file, SmartQuizUserDetails currentUser) {
        List<String> errors = new ArrayList<>();
        int success = 0;
        int rowNum = 1;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // skip header
                rowNum = row.getRowNum() + 1;

                try {
                    McqQuestion question = parseRow(row, currentUser);
                    mcqRepo.save(question);
                    success++;
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                    log.warn("Bulk upload row {} failed: {}", rowNum, e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Failed to parse bulk upload file", e);
            errors.add("Failed to read file: " + e.getMessage());
        }

        return BulkUploadResponse.builder()
                .totalRows(rowNum - 1)
                .successCount(success)
                .failureCount(errors.size())
                .errors(errors)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest req) {
        SimilarityOutcome outcome = similarityService.analyze(
                req.stackId(), req.topicId(),
                req.questionStem(), req.options(), req.excludeId());

        double threshold = similarityService.threshold();
        boolean duplicate = outcome.maxScore() >= threshold;

        List<SimilarQuestionResponse> similar = outcome.matchesAtOrAbove(threshold).stream()
                .map(m -> McqMapper.toSimilarResponse(m.question(), m.score()))
                .toList();

        return DuplicateCheckResponse.builder()
                .duplicate(duplicate)
                .maxSimilarityPercent(McqMapper.toPercent(outcome.maxScore()))
                .thresholdPercent((int) Math.round(threshold * 100))
                .similar(similar)
                .build();
    }

    /**
     * Parses a bulk-upload XLSX row.
     *
     * Expected column layout:
     *   0  – Question Stem
     *   1  – Options (pipe-separated, at least 4: "Opt1|Opt2|Opt3|Opt4")
     *   2  – Correct option indices (comma-separated, 0-based: "1" or "0,2")
     *   3  – Difficulty (EASY / MEDIUM / HARD)
     *   4  – Stack Name
     *   5  – Topic Name
     */
    private McqQuestion parseRow(Row row, SmartQuizUserDetails currentUser) {
        String questionStem      = getCellString(row, 0);
        String optionsPiped      = getCellString(row, 1);
        String correctIdxStr     = getCellString(row, 2);
        String difficultyStr     = getCellString(row, 3).toUpperCase();
        String stackName         = getCellString(row, 4);
        String topicName         = getCellString(row, 5);

        if (questionStem.isBlank()) throw new IllegalArgumentException("Question stem is empty");
        if (mcqRepo.existsByQuestionStemIgnoreCase(questionStem))
            throw new IllegalArgumentException("Duplicate question — already exists in the question bank");

        List<String> options = Arrays.stream(optionsPiped.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
        if (options.size() < 4)
            throw new IllegalArgumentException("At least 4 options required (pipe-separated in column 2)");

        List<Integer> correctIndices;
        try {
            correctIndices = Arrays.stream(correctIdxStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Correct option indices must be comma-separated integers (0-based)");
        }
        if (correctIndices.isEmpty())
            throw new IllegalArgumentException("At least one correct option index is required");
        if (correctIndices.stream().anyMatch(i -> i < 0 || i >= options.size()))
            throw new IllegalArgumentException("Correct option indices out of range (must be 0 to " + (options.size() - 1) + ")");

        Difficulty difficulty;
        try {
            difficulty = Difficulty.valueOf(difficultyStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty: " + difficultyStr);
        }

        TechnologyStack stack = stackRepo.findAll().stream()
                .filter(s -> s.getStackName().equalsIgnoreCase(stackName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown stack: " + stackName));

        Topic topic = topicRepo.findByStackIdAndTopicNameIgnoreCase(stack.getId(), topicName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown topic: " + topicName));

        return McqQuestion.builder()
                .questionStem(questionStem)
                .options(options)
                .correctOptionIndices(correctIndices)
                .difficulty(difficulty)
                .stack(stack)
                .topic(topic)
                .creator(userRepo.getReferenceById(currentUser.getUserId()))
                .status(McqStatus.DRAFT)
                .build();
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    private McqQuestion findQuestionById(Long id) {
        return mcqRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("McqQuestion", id));
    }

    private void assertCanEdit(McqQuestion question, SmartQuizUserDetails currentUser) {
        // Story 1.3 — "rejected for life": a rejected question is permanently locked from
        // all edits, for everyone including admins.
        if (question.getStatus() == McqStatus.REJECTED) {
            throw new UnauthorizedAccessException(
                "This question has been permanently rejected and can no longer be edited");
        }

        boolean isCreator = question.getCreator().getId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        boolean creatorEditable = isCreator &&
                (question.getStatus() == McqStatus.DRAFT ||
                 question.getStatus() == McqStatus.READY_FOR_REVIEW ||
                 question.getStatus() == McqStatus.MODIFICATION_REQUESTED);

        if (!creatorEditable && !isAdmin) {
            throw new UnauthorizedAccessException(
                "You can only edit your own questions in DRAFT, READY FOR REVIEW, or MODIFICATION REQUESTED status");
        }
    }

    private void assertCanView(McqQuestion question, SmartQuizUserDetails currentUser) {
        boolean isCreator = question.getCreator().getId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isReviewer = question.getReviewer() != null &&
                             question.getReviewer().getId().equals(currentUser.getUserId());

        if (!isCreator && !isAdmin && !isReviewer) {
            throw new UnauthorizedAccessException("You don't have access to this question");
        }
    }

    // ── Level 3: Full-text search ──────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<McqResponse> searchQuestions(String query, SmartQuizUserDetails currentUser) {
        if (query == null || query.isBlank()) return List.of();
        List<McqQuestion> results = mcqRepo.searchFullText(query.trim());
        return results.stream()
                .filter(q -> canViewQuestion(q, currentUser))
                .map(McqMapper::toResponse)
                .toList();
    }

    private boolean canViewQuestion(McqQuestion question, SmartQuizUserDetails currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) return true;
        Long uid = currentUser.getUserId();
        boolean isCreator = question.getCreator().getId().equals(uid);
        boolean isReviewer = question.getReviewer() != null && question.getReviewer().getId().equals(uid);
        return isCreator || isReviewer;
    }

    // ── Level 3: XLSX export ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToXlsx(Long stackId, Long topicId, Difficulty difficulty, McqStatus status) {
        List<McqQuestion> questions = mcqRepo.findForExport(
                status == null ? McqStatus.APPROVED : status, stackId, topicId, difficulty);

        // Determine the maximum number of options across all questions (at least 4)
        int maxOptions = questions.stream()
                .mapToInt(q -> q.getOptions() == null ? 0 : q.getOptions().size())
                .max().orElse(4);
        maxOptions = Math.max(maxOptions, 4);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Questions");

            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Build dynamic headers
            List<String> headers = new ArrayList<>(
                    List.of("ID", "Stack", "Topic", "Difficulty", "Status", "Question"));
            for (int i = 1; i <= maxOptions; i++) headers.add("Option " + i);
            headers.addAll(List.of("Correct Options (1-based)", "Creator", "Reviewer", "AI Score"));

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (McqQuestion q : questions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(q.getId());
                row.createCell(1).setCellValue(q.getStack().getStackName());
                row.createCell(2).setCellValue(q.getTopic().getTopicName());
                row.createCell(3).setCellValue(q.getDifficulty().name());
                row.createCell(4).setCellValue(q.getStatus().name());
                row.createCell(5).setCellValue(q.getQuestionStem());

                List<String> opts = q.getOptions() != null ? q.getOptions() : List.of();
                for (int i = 0; i < maxOptions; i++) {
                    row.createCell(6 + i).setCellValue(i < opts.size() ? opts.get(i) : "");
                }

                int correctCol = 6 + maxOptions;
                String correctLabel = q.getCorrectOptionIndices() == null ? "" :
                        q.getCorrectOptionIndices().stream()
                                .map(i -> String.valueOf(i + 1))
                                .collect(Collectors.joining(", "));
                row.createCell(correctCol).setCellValue(correctLabel);
                row.createCell(correctCol + 1).setCellValue(q.getCreator().getFullName());
                row.createCell(correctCol + 2).setCellValue(
                        q.getReviewer() != null ? q.getReviewer().getFullName() : "");
                row.createCell(correctCol + 3).setCellValue(
                        q.getAiSimilarityScore() != null ? q.getAiSimilarityScore().doubleValue() : 0.0);
            }

            for (int i = 0; i < headers.size(); i++) sheet.autoSizeColumn(i);

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate XLSX export", e);
        }
    }

    private Specification<McqQuestion> buildSpec(McqStatus status, Long stackId, Difficulty difficulty,
                                                   SmartQuizUserDetails currentUser) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if (currentUser.getRole() != UserRole.ADMIN) {
                predicates.add(cb.or(
                        cb.equal(root.get("creator").get("id"), currentUser.getUserId()),
                        cb.equal(root.get("reviewer").get("id"), currentUser.getUserId())
                ));
            }
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (stackId != null) predicates.add(cb.equal(root.get("stack").get("id"), stackId));
            if (difficulty != null) predicates.add(cb.equal(root.get("difficulty"), difficulty));

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
