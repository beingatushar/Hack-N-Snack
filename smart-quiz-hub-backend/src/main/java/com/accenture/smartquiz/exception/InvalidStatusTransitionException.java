package com.accenture.smartquiz.exception;

import com.accenture.smartquiz.entity.enums.McqStatus;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(McqStatus from, McqStatus to) {
        super("Cannot transition MCQ status from " + from + " to " + to);
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
