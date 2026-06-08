package com.accenture.smartquiz.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BulkUploadResponse {

    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<String> errors;
}
