package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.McqQuestion;
import com.accenture.smartquiz.entity.enums.Difficulty;
import com.accenture.smartquiz.entity.enums.McqStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface McqQuestionRepository extends JpaRepository<McqQuestion, Long>,
        JpaSpecificationExecutor<McqQuestion> {

    Page<McqQuestion> findByCreatorId(Long creatorId, Pageable pageable);

    Page<McqQuestion> findByCreatorIdAndStatus(Long creatorId, McqStatus status, Pageable pageable);

    Page<McqQuestion> findByReviewerIdAndStatus(Long reviewerId, McqStatus status, Pageable pageable);

    Page<McqQuestion> findByReviewerIdAndStatusIn(Long reviewerId, List<McqStatus> statuses, Pageable pageable);

    Page<McqQuestion> findByStatus(McqStatus status, Pageable pageable);

    long countByCreatorId(Long creatorId);

    long countByCreatorIdAndStatus(Long creatorId, McqStatus status);

    long countByStatus(McqStatus status);

    @Query("SELECT q FROM McqQuestion q WHERE q.stack.id = :stackId AND q.status = 'APPROVED'")
    List<McqQuestion> findApprovedByStackId(@Param("stackId") Long stackId);

    /** All questions in a given stack + topic — used for duplicate / similarity detection. */
    List<McqQuestion> findByStackIdAndTopicId(Long stackId, Long topicId);

    @Query("SELECT COUNT(q) FROM McqQuestion q WHERE q.reviewer.id = :reviewerId AND q.status = :status")
    long countByReviewerIdAndStatus(@Param("reviewerId") Long reviewerId, @Param("status") McqStatus status);

    boolean existsByQuestionStemIgnoreCase(String questionStem);

    /** Full-text search using the pre-built tsvector column (ranked by relevance). */
    @Query(value = """
            SELECT * FROM mcq_questions
            WHERE search_vector @@ plainto_tsquery('english', :query)
            ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC
            """, nativeQuery = true)
    List<McqQuestion> searchFullText(@Param("query") String query);

    /** Filtered export query — null params are treated as "all". */
    @Query("SELECT q FROM McqQuestion q WHERE q.status = :status " +
            "AND (:stackId IS NULL OR q.stack.id = :stackId) " +
            "AND (:topicId IS NULL OR q.topic.id = :topicId) " +
            "AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
    List<McqQuestion> findForExport(@Param("status") McqStatus status,
                                    @Param("stackId") Long stackId,
                                    @Param("topicId") Long topicId,
                                    @Param("difficulty") Difficulty difficulty);

    /** Analytics: count questions grouped by stack (returns [stackName, count]). */
    @Query("SELECT q.stack.stackName, COUNT(q) FROM McqQuestion q GROUP BY q.stack.stackName")
    List<Object[]> countByStack();

    /** Analytics: count questions grouped by difficulty. */
    @Query("SELECT q.difficulty, COUNT(q) FROM McqQuestion q GROUP BY q.difficulty")
    List<Object[]> countByDifficulty();

    /** Analytics: per-reviewer UNDER_REVIEW count. */
    @Query("SELECT q.reviewer.fullName, COUNT(q) FROM McqQuestion q " +
            "WHERE q.status = 'UNDER_REVIEW' AND q.reviewer IS NOT NULL GROUP BY q.reviewer.fullName")
    List<Object[]> reviewerWorkload();

    /** Analytics: questions created per week for the last N weeks. */
    @Query(value = """
            SELECT date_trunc('week', created_at)::DATE AS week, COUNT(*) AS cnt
            FROM mcq_questions
            WHERE created_at >= NOW() - INTERVAL '12 weeks'
            GROUP BY 1 ORDER BY 1
            """, nativeQuery = true)
    List<Object[]> weeklyCreationTrend();

    /** Auto-assign: READY_FOR_REVIEW questions that have no reviewer yet. */
    @Query("SELECT q FROM McqQuestion q WHERE q.status = 'READY_FOR_REVIEW' AND q.reviewer IS NULL")
    List<McqQuestion> findUnassignedReadyForReview();
}
