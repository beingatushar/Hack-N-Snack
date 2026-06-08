package com.accenture.smartquiz.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BulkAssignRequest {

    @NotEmpty(message = "At least one question ID is required")
    @Size(max = 100, message = "Cannot bulk-assign more than 100 questions at once")
    private List<Long> questionIds;

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;
}
