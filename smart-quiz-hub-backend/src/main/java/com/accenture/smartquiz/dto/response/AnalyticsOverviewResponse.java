package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class AnalyticsOverviewResponse {

    /** Total questions by status (key = McqStatus name). */
    private Map<String, Long> byStatus;

    /** Total questions by stack (key = stackName). */
    private Map<String, Long> byStack;

    /** Total questions by difficulty (key = Difficulty name). */
    private Map<String, Long> byDifficulty;

    /** Weekly creation counts for last 12 weeks (ordered oldest→newest). */
    private List<WeeklyCount> weeklyTrend;

    @Getter
    @Builder
    public static class WeeklyCount {
        private String week;   // ISO date of week start (YYYY-MM-DD)
        private long count;
    }
}
