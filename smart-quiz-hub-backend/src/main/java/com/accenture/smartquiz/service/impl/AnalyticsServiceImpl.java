package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.response.AnalyticsOverviewResponse;
import com.accenture.smartquiz.dto.response.ReviewerWorkloadResponse;
import com.accenture.smartquiz.entity.enums.McqStatus;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import com.accenture.smartquiz.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final McqQuestionRepository mcqRepo;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview() {
        // Status counts — enumerate every status so zeros show up in the chart
        Map<String, Long> byStatus = new LinkedHashMap<>();
        Arrays.stream(McqStatus.values()).forEach(s ->
                byStatus.put(s.name(), mcqRepo.countByStatus(s)));

        // Stack counts from aggregate query
        Map<String, Long> byStack = mcqRepo.countByStack().stream()
                .collect(Collectors.toMap(
                        r -> (String) r[0],
                        r -> (Long) r[1],
                        (a, b) -> a,
                        LinkedHashMap::new));

        // Difficulty counts
        Map<String, Long> byDifficulty = mcqRepo.countByDifficulty().stream()
                .collect(Collectors.toMap(
                        r -> r[0].toString(),
                        r -> (Long) r[1],
                        (a, b) -> a,
                        LinkedHashMap::new));

        // Weekly trend
        List<AnalyticsOverviewResponse.WeeklyCount> trend = mcqRepo.weeklyCreationTrend().stream()
                .map(r -> AnalyticsOverviewResponse.WeeklyCount.builder()
                        .week(r[0].toString())
                        .count(((Number) r[1]).longValue())
                        .build())
                .toList();

        return AnalyticsOverviewResponse.builder()
                .byStatus(byStatus)
                .byStack(byStack)
                .byDifficulty(byDifficulty)
                .weeklyTrend(trend)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewerWorkloadResponse> getReviewerWorkload() {
        return mcqRepo.reviewerWorkload().stream()
                .map(r -> ReviewerWorkloadResponse.builder()
                        .reviewerName((String) r[0])
                        .pendingCount(((Number) r[1]).longValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getPendingCount(), a.getPendingCount()))
                .toList();
    }
}
