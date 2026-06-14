package com.accenture.smartquiz.dto.response;

/**
 * Per-SME performance report (Story 2.1). Java 21 record (Story 3.1).
 *
 * @param avgTurnaroundHours average review turnaround (submission → decision) in hours;
 *                           {@code null} when the SME recorded no decisions in the range.
 */
public record SmeReportResponse(
        Long smeId,
        String smeName,
        long authoredCount,
        long reviewedCount,
        long approvedCount,
        long rejectedCount,
        long modificationRequestedCount,
        double approvalRate,
        Double avgTurnaroundHours,
        long pendingCount
) {}
