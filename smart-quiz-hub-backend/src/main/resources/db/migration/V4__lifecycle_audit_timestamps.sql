-- V4: Lifecycle audit timestamps (Epic 1 / Epic 2)
-- Adds submitted_at and reviewed_at so review turnaround time can be reported per SME.
-- The MODIFICATION_REQUESTED status needs no DDL — `status` is VARCHAR(50), not a CHECK/enum.

ALTER TABLE mcq_questions
    ADD COLUMN submitted_at TIMESTAMPTZ,
    ADD COLUMN reviewed_at  TIMESTAMPTZ;

-- Backfill historical rows so the new analytics has data to work with.
-- created_at approximates the original submission; updated_at approximates the decision time.
UPDATE mcq_questions
SET submitted_at = created_at
WHERE status IN ('READY_FOR_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MODIFICATION_REQUESTED');

UPDATE mcq_questions
SET reviewed_at = updated_at
WHERE status IN ('APPROVED', 'REJECTED', 'MODIFICATION_REQUESTED');

CREATE INDEX IF NOT EXISTS idx_mcq_reviewed_at ON mcq_questions (reviewed_at);
CREATE INDEX IF NOT EXISTS idx_mcq_created_at  ON mcq_questions (created_at);
