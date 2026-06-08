package com.accenture.smartquiz.exception;

import java.util.List;

public class BulkUploadException extends RuntimeException {

    private final List<String> errors;

    public BulkUploadException(String message, List<String> errors) {
        super(message);
        this.errors = errors;
    }

    public BulkUploadException(String message) {
        super(message);
        this.errors = List.of(message);
    }

    public List<String> getErrors() {
        return errors;
    }
}
