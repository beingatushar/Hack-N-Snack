package com.accenture.smartquiz.config;

import com.accenture.smartquiz.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int  MAX_ATTEMPTS   = 5;
    private static final long LOCKOUT_MILLIS = 15 * 60 * 1000L; // 15 minutes

    private record AttemptRecord(int count, Instant lockedUntil) {}

    private final ConcurrentHashMap<String, AttemptRecord> store = new ConcurrentHashMap<>();

    public void recordFailure(String enterpriseId) {
        store.compute(enterpriseId, (k, existing) -> {
            int count = (existing == null ? 0 : existing.count()) + 1;
            Instant lockedUntil = count >= MAX_ATTEMPTS
                    ? Instant.now().plusMillis(LOCKOUT_MILLIS)
                    : (existing != null ? existing.lockedUntil() : null);
            return new AttemptRecord(count, lockedUntil);
        });
    }

    public void checkAllowed(String enterpriseId) {
        AttemptRecord record = store.get(enterpriseId);
        if (record == null) return;
        if (record.lockedUntil() != null && Instant.now().isBefore(record.lockedUntil())) {
            throw new UnauthorizedAccessException(
                    "Account temporarily locked due to too many failed attempts. Try again in 15 minutes.");
        }
    }

    public void reset(String enterpriseId) {
        store.remove(enterpriseId);
    }
}
