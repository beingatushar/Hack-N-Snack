-- Smart Quiz AI Hub — Master Schema + Seed
-- Single source of truth for the full database setup.

-- ════════════════════════════════════════════════════
--  SCHEMA
-- ════════════════════════════════════════════════════

-- Users
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    enterprise_id VARCHAR(100) NOT NULL UNIQUE,
    full_name     VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'SME',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Technology stacks
CREATE TABLE technology_stacks (
    id          BIGSERIAL    PRIMARY KEY,
    stack_name  VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Topics linked to stacks
CREATE TABLE topics (
    id          BIGSERIAL    PRIMARY KEY,
    stack_id    BIGINT       NOT NULL REFERENCES technology_stacks(id) ON DELETE CASCADE,
    topic_name  VARCHAR(300) NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(stack_id, topic_name)
);

-- User <-> Stack skill mappings
CREATE TABLE user_stack_mappings (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stack_id   BIGINT      NOT NULL REFERENCES technology_stacks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, stack_id)
);

-- MCQ Questions
CREATE TABLE mcq_questions (
    id                  BIGSERIAL     PRIMARY KEY,
    question_stem       TEXT          NOT NULL,
    option_a            VARCHAR(1000) NOT NULL,
    option_b            VARCHAR(1000) NOT NULL,
    option_c            VARCHAR(1000) NOT NULL,
    option_d            VARCHAR(1000) NOT NULL,
    correct_option      CHAR(1)       NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    difficulty          VARCHAR(50)   NOT NULL,
    stack_id            BIGINT        NOT NULL REFERENCES technology_stacks(id),
    topic_id            BIGINT        NOT NULL REFERENCES topics(id),
    status              VARCHAR(50)   NOT NULL DEFAULT 'DRAFT',
    creator_id          BIGINT        NOT NULL REFERENCES users(id),
    reviewer_id         BIGINT        REFERENCES users(id),
    reviewer_comments   TEXT,
    ai_similarity_score DECIMAL(5,4),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mcq_creator  ON mcq_questions(creator_id);
CREATE INDEX idx_mcq_reviewer ON mcq_questions(reviewer_id);
CREATE INDEX idx_mcq_status   ON mcq_questions(status);
CREATE INDEX idx_mcq_stack    ON mcq_questions(stack_id);
CREATE INDEX idx_topic_stack  ON topics(stack_id);
CREATE INDEX idx_usm_user     ON user_stack_mappings(user_id);
CREATE INDEX idx_usm_stack    ON user_stack_mappings(stack_id);

-- ════════════════════════════════════════════════════
--  SEED — Technology Stacks
-- ════════════════════════════════════════════════════
INSERT INTO technology_stacks (stack_name) VALUES
    ('Spring Cloud'),
    ('Spring Boot'),
    ('Spring Core'),
    ('Spring MVC & REST'),
    ('Spring ORM & Data JPA'),
    ('Core Java');

-- ════════════════════════════════════════════════════
--  SEED — Topics  (stack IDs match insertion order above)
-- ════════════════════════════════════════════════════

-- Spring Cloud (id=1)
INSERT INTO topics (stack_id, topic_name) VALUES
    (1, 'Introduction to Spring Cloud'),
    (1, 'Service Discovery design pattern – Eureka Server & Discovery Client'),
    (1, 'Eureka Heartbeats & Self Preservation'),
    (1, 'Spring Cloud Loadbalancer'),
    (1, 'Spring Cloud OpenFeign'),
    (1, 'Resilience4J- Circuit Breaker'),
    (1, 'Spring Boot Actuator');

-- Spring Boot (id=2)
INSERT INTO topics (stack_id, topic_name) VALUES
    (2, 'Spring Boot Introduction'),
    (2, 'Spring Boot Project Setup'),
    (2, 'Spring Boot Starters'),
    (2, 'SpringBootApplication annotation'),
    (2, 'SpringApplication'),
    (2, 'Auto Configuration'),
    (2, 'Spring Boot DevTools');

-- Spring Core (id=3)
INSERT INTO topics (stack_id, topic_name) VALUES
    (3, 'Dependency Injection'),
    (3, 'Inversion of Control'),
    (3, 'Bean Lifecycle'),
    (3, 'Spring Annotations'),
    (3, 'ApplicationContext');

-- Spring MVC & REST (id=4)
INSERT INTO topics (stack_id, topic_name) VALUES
    (4, 'DispatcherServlet'),
    (4, 'REST Controllers'),
    (4, 'Request Mapping'),
    (4, 'Exception Handling'),
    (4, 'Content Negotiation');

-- Spring ORM & Data JPA (id=5)
INSERT INTO topics (stack_id, topic_name) VALUES
    (5, 'JPA Entities'),
    (5, 'Spring Data Repositories'),
    (5, 'JPQL Queries'),
    (5, 'Transaction Management'),
    (5, 'Hibernate Integration');

-- Core Java (id=6)
INSERT INTO topics (stack_id, topic_name) VALUES
    (6, 'OOP Concepts'),
    (6, 'Collections Framework'),
    (6, 'Java Streams'),
    (6, 'Exception Handling'),
    (6, 'Multithreading');

-- ════════════════════════════════════════════════════
--  SEED — Users
--  Password hash = BCrypt(strength=12) of "Admin@123"
-- ════════════════════════════════════════════════════
INSERT INTO users (enterprise_id, full_name, email, password, role) VALUES
    ('admin.user',             'System Admin',          'admin@accenture.com',                     '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'ADMIN'),
    ('gaurav.a.bhola',         'Gaurav Bhola',          'gaurav.a.bhola@accenture.com',            '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'SME'),
    ('birendra.kumar.singh',   'Birendra Kumar Singh',  'birendra.kumar.singh@accenture.com',      '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'SME'),
    ('divya.madhanasekar',     'Divya Madhanasekar',    'divya.madhanasekar@accenture.com',        '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'SME'),
    ('swati.avinash.nikam',    'Swati Avinash Nikam',   'swati.avinash.nikam@accenture.com',       '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'SME'),
    ('indugu.hari.prasad',     'Indugu Hari Prasad',    'indugu.hari.prasad@accenture.com',        '$2a$12$PBPG9CxmkSnRhs.lWqNCjuSxmOK/LJ1gRggOUWT/XE0EKyZvN9gMK', 'SME');

-- ════════════════════════════════════════════════════
--  SEED — SME → Stack skill mappings
-- ════════════════════════════════════════════════════
-- gaurav.a.bhola (id=2): Spring Cloud, Spring Core
INSERT INTO user_stack_mappings (user_id, stack_id) VALUES (2,1),(2,3);
-- birendra.kumar.singh (id=3): Spring Boot
INSERT INTO user_stack_mappings (user_id, stack_id) VALUES (3,2);
-- divya.madhanasekar (id=4): Spring MVC & REST, Spring Cloud
INSERT INTO user_stack_mappings (user_id, stack_id) VALUES (4,4),(4,1);
-- swati.avinash.nikam (id=5): Spring Boot
INSERT INTO user_stack_mappings (user_id, stack_id) VALUES (5,2);
-- indugu.hari.prasad (id=6): Spring Cloud
INSERT INTO user_stack_mappings (user_id, stack_id) VALUES (6,1);

-- ════════════════════════════════════════════════════
--  SEED — Sample MCQ Questions
-- ════════════════════════════════════════════════════
INSERT INTO mcq_questions
    (question_stem, option_a, option_b, option_c, option_d, correct_option, difficulty, stack_id, topic_id, status, creator_id)
VALUES
    (
        'Alex is building a microservices-based system using Spring Boot. He wants features like centralized configuration, service discovery, and client-side load balancing without building everything from scratch. Which is the primary purpose of Spring Cloud?',
        'To replace Spring Boot completely',
        'To provide tools for building distributed systems and microservices',
        'To manage only database transactions',
        'To handle only UI development',
        'B', 'MEDIUM', 1, 1, 'READY_FOR_REVIEW', 3
    ),
    (
        'John has multiple instances of a service running dynamically in the cloud. He wants each service to automatically register itself and discover others without hardcoding URLs. Which component is used for this purpose?',
        'Spring MVC',
        'Eureka Server',
        'Hibernate',
        'Apache Tomcat',
        'B', 'MEDIUM', 1, 2, 'APPROVED', 3
    );
