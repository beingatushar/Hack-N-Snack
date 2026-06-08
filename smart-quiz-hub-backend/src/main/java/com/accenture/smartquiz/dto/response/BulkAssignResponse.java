package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BulkAssignResponse {

    private int assigned;
    private int skipped;
    private List<String> skippedReasons;
}
