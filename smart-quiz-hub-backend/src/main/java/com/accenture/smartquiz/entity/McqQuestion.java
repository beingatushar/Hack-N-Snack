package com.accenture.smartquiz.entity;

import com.accenture.smartquiz.entity.enums.Difficulty;
import com.accenture.smartquiz.entity.enums.McqStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "mcq_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_stem", nullable = false, columnDefinition = "TEXT")
    private String questionStem;

    @Column(name = "option_a", nullable = false, length = 1000)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 1000)
    private String optionB;

    @Column(name = "option_c", nullable = false, length = 1000)
    private String optionC;

    @Column(name = "option_d", nullable = false, length = 1000)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Difficulty difficulty;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stack_id", nullable = false)
    private TechnologyStack stack;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private McqStatus status = McqStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;

    @Column(name = "ai_similarity_score", precision = 5, scale = 4)
    private BigDecimal aiSimilarityScore;

    @Version
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
