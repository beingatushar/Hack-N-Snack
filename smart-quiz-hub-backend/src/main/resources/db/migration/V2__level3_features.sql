-- Level 3 feature additions
-- 1. Optimistic locking on mcq_questions
-- 2. PostgreSQL full-text search (GIN index on generated tsvector)
-- 3. In-app notifications table

-- ── 1. Optimistic locking ────────────────────────────────────────────────────
ALTER TABLE mcq_questions ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- ── 2. Full-text search ──────────────────────────────────────────────────────
ALTER TABLE mcq_questions
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(question_stem, '') || ' ' ||
            coalesce(option_a,      '') || ' ' ||
            coalesce(option_b,      '') || ' ' ||
            coalesce(option_c,      '') || ' ' ||
            coalesce(option_d,      ''))
    ) STORED;

CREATE INDEX idx_mcq_fts ON mcq_questions USING GIN(search_vector);

-- ── 3. Notifications ─────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    question_id BIGINT       REFERENCES mcq_questions(id) ON DELETE SET NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user   ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read) WHERE NOT is_read;
