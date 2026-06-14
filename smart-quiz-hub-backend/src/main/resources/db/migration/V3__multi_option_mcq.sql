-- V3: Multi-option MCQ support
-- Replaces fixed option_a/b/c/d + correct_option columns with JSONB arrays
-- supporting variable number of options (min 4) and multiple correct answers.

-- 1. Drop the FTS generated column first (it depends on the old option columns)
ALTER TABLE mcq_questions DROP COLUMN IF EXISTS search_vector;
DROP INDEX IF EXISTS idx_mcq_fts;

-- 2. Add new JSONB columns (nullable during migration)
ALTER TABLE mcq_questions
    ADD COLUMN options               JSONB,
    ADD COLUMN correct_option_indices JSONB;

-- 3. Migrate existing data: [optionA, optionB, optionC, optionD] and letter → index
UPDATE mcq_questions
SET options = json_build_array(option_a, option_b, option_c, option_d),
    correct_option_indices = CASE correct_option
        WHEN 'A' THEN '[0]'::jsonb
        WHEN 'B' THEN '[1]'::jsonb
        WHEN 'C' THEN '[2]'::jsonb
        WHEN 'D' THEN '[3]'::jsonb
        ELSE '[0]'::jsonb
    END;

-- 4. Enforce NOT NULL now that all rows are populated
ALTER TABLE mcq_questions
    ALTER COLUMN options                SET NOT NULL,
    ALTER COLUMN correct_option_indices SET NOT NULL;

-- 5. Drop old columns (also removes the CHECK constraint on correct_option)
ALTER TABLE mcq_questions
    DROP COLUMN option_a,
    DROP COLUMN option_b,
    DROP COLUMN option_c,
    DROP COLUMN option_d,
    DROP COLUMN correct_option;

-- 6. Re-create FTS vector over question stem + all option strings in the JSONB array
ALTER TABLE mcq_questions
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(question_stem, '')) ||
        jsonb_to_tsvector('english', coalesce(options, '[]'::jsonb), '"string"')
    ) STORED;

CREATE INDEX idx_mcq_fts ON mcq_questions USING GIN(search_vector);
