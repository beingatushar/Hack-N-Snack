package com.accenture.smartquiz.config;

import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple sliding-window rate limiter for AI generate calls.
 * Each user is allowed up to MAX_CALLS requests within a WINDOW_MS sliding window.
 * State is in-process; resets on restart (acceptable for a demo / hackathon context).
 */
@Component
public class AiRateLimiter {

    private static final int MAX_CALLS = 10;
    private static final long WINDOW_MS = 60 * 60 * 1_000L; // 1 hour

    private final ConcurrentHashMap<Long, Deque<Long>> windows = new ConcurrentHashMap<>();

    /**
     * Attempts to consume one token for the given user.
     * @return true if the request is allowed, false if the limit is exceeded
     */
    public boolean tryAcquire(Long userId) {
        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW_MS;

        Deque<Long> timestamps = windows.computeIfAbsent(userId, id -> new ArrayDeque<>());

        synchronized (timestamps) {
            // Evict expired entries
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= MAX_CALLS) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }

    /** Returns how many calls the user still has available in the current window. */
    public int remainingCalls(Long userId) {
        long windowStart = System.currentTimeMillis() - WINDOW_MS;
        Deque<Long> timestamps = windows.getOrDefault(userId, new ArrayDeque<>());
        synchronized (timestamps) {
            long active = timestamps.stream().filter(t -> t >= windowStart).count();
            return (int) Math.max(0, MAX_CALLS - active);
        }
    }
}
