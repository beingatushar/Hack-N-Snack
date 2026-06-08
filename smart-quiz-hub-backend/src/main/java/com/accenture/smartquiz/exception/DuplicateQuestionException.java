package com.accenture.smartquiz.exception;

public class DuplicateQuestionException extends RuntimeException {

    public DuplicateQuestionException(String message) {
        super(message);
    }

    public DuplicateQuestionException(double similarityScore) {
        super("Question is too similar to an existing question (similarity: " +
              String.format("%.1f%%", similarityScore * 100) + ")");
    }
}
