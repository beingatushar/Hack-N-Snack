package com.accenture.smartquiz.dto.response;

import java.util.Map;

/**
 * Question-performance analytics over a date range (Story 2.2). Java 21 record (Story 3.1).
 *
 * <p>Reports dimensions that exist in the question-authoring domain (status / stack /
 * difficulty distribution, approval rate, AI-similarity). End-user "success rate" and
 * "usage frequency" are intentionally omitted — they require a quiz-attempt subsystem
 * that this platform does not (yet) have.
 *
 * @param approvalRate         approved / (approved + rejected) as a percentage
 * @param avgSimilarityPercent average AI duplicate-similarity score (0–100); {@code null} when none scored
 */
public record QuestionAnalyticsResponse(
        long total,
        Map<String, Long> byStatus,
        Map<String, Long> byStack,
        Map<String, Long> byDifficulty,
        long approvedCount,
        long rejectedCount,
        double approvalRate,
        Double avgSimilarityPercent
) {}
