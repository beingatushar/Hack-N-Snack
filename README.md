# Smart Quiz AI Hub

An enterprise-grade AI-powered MCQ platform for creating, reviewing, and managing technical assessment questions at scale — built with Spring Boot, Angular, and PostgreSQL.

---

## What It Does

Smart Quiz AI Hub enables organizations to build and govern a quality-controlled question bank for technical assessments. SMEs author MCQs, submit them for peer review, and an admin oversees the full lifecycle. AI features accelerate authoring (generate questions), enforce quality (duplicate detection), and assist reviewers (AI quality analysis).

---

## User Roles

### SME (Subject Matter Expert) — default role
- Create, draft, and submit MCQ questions
- Accept or discard AI-generated questions
- Review questions assigned to them (approve / reject / request modifications)
- View personal analytics — authored, reviewed, approval rate
- Self-assign technology stack skills
- Participate in per-question discussion threads
- Receive notifications for review assignments, decisions, and comments

### Admin
- All SME capabilities
- Manage user accounts (create, update, activate/deactivate, reset passwords, delete)
- Assign and bulk-assign reviewers to questions; trigger auto-assign to least-loaded SME
- Manage technology stacks and topics
- View system-wide analytics and per-SME performance reports
- Export analytics to CSV
- Access global audit trail

---

## Features

### Question Lifecycle
- **Statuses**: `DRAFT → READY_FOR_REVIEW → UNDER_REVIEW → APPROVED / REJECTED / MODIFICATION_REQUESTED`
- **AI_PENDING**: AI-generated questions held for SME acceptance before entering the normal flow
- Full audit trail of every state transition (immutable, survives user deletion)

### MCQ Authoring
- Variable number of options (4+) stored as JSONB
- Multiple correct answers supported
- Difficulty levels: EASY / MEDIUM / HARD
- Bulk upload from XLSX template; export questions to XLSX
- Full-text search across question stem and all option text (PostgreSQL tsvector + GIN index)

### AI Features
- **Generate**: Produce MCQs from a topic/stack prompt; auto-screened — questions with >30% similarity to existing ones are replaced inline
- **Duplicate Check**: Cosine-similarity check on candidate questions via Spring AI embeddings
- **AI Review**: LLM quality analysis of any MCQ; heuristic fallback when AI is unavailable
- **Rate limit**: 10 AI calls per user per hour (generate + review combined)

### Review Workflow
- Reviewer assigned per question (manual, bulk, or auto-assign to least-loaded eligible SME)
- SLA enforcement: reminder notification at 24 h, escalation to all admins at 48 h
- Inline discussion thread between creator and reviewer

### Notifications
- In-app notification feed (REVIEW_ASSIGNED, QUESTION_APPROVED, QUESTION_REJECTED, MODIFICATION_REQUESTED, REVIEW_REMINDER, REVIEW_ESCALATED, NEW_COMMENT)
- Real-time delivery via Server-Sent Events (SSE)

### Analytics
- System overview: questions by status / stack / difficulty with trend charts
- Per-SME performance: authored, reviewed, approval rate, average turnaround, backlog
- Reviewer workload: pending count per reviewer
- CSV export for both report types

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21 · Spring Boot 3.3.4 · Spring Security (JWT) · Spring Data JPA · MapStruct |
| Frontend | Angular 21 · TypeScript 5.9 · Tailwind CSS · Angular Material · Chart.js |
| Database | PostgreSQL 16 · Flyway migrations · JSONB · Full-Text Search (tsvector + GIN) |
| AI | Groq (OpenAI-compatible, free tier) · Spring AI 1.0.0-M3 (chat + embeddings) |
| Infra | Docker · Docker Compose |
| API Docs | SpringDoc OpenAPI 2.6.0 · Swagger UI |
| Other | Apache POI 5.3.0 (XLSX) · jjwt 0.12.6 · Lombok · Virtual Threads (Java 21) |

---

## Running the App

See **[HOW-TO-RUN.md](HOW-TO-RUN.md)** — 2 commands to get started with Docker.

### Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| Actuator Health | http://localhost:8080/api/actuator/health |

---

## Environment Variables

All variables live in `.env` at the project root (gitignored — never commit it).

| Variable | Default | Description |
|---|---|---|
| `DB_NAME` | `smart_quiz_hub` | PostgreSQL database name |
| `DB_USERNAME` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | *(required)* | PostgreSQL password |
| `DB_PORT` | `5433` | Host port (avoids conflict with local 5432) |
| `BACKEND_PORT` | `8080` | Host port for Spring Boot |
| `FRONTEND_PORT` | `4200` | Host port for Angular dev server |
| `JWT_SECRET` | *(required)* | 256-bit secret — generate with `openssl rand -base64 48` |
| `JWT_EXPIRATION_MS` | `86400000` | Token validity (24 h) |
| `OPENAI_API_KEY` | *(required)* | Groq key (`gsk_…`) — free at console.groq.com |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai` | AI provider base URL |
| `OPENAI_MODEL` | `llama-3.3-70b-versatile` | Chat model |
| `AI_EMBEDDINGS_ENABLED` | `true` | Enable embedding-based duplicate detection |
| `AI_SIMILARITY_THRESHOLD` | `0.30` | Block/replace if similarity ≥ this |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Allowed frontend origin |
| `BACKEND_URL` | `http://backend:8080` | Angular proxy target (keep as-is for Docker) |

To use OpenAI instead of Groq, set `OPENAI_API_KEY=sk-…`, `OPENAI_BASE_URL=https://api.openai.com`, `OPENAI_MODEL=gpt-4o-mini`.

---

## Project Structure

```
Hack-N-Snack/
├── .env                             # secrets & config (gitignored)
├── docker-compose.yml               # orchestrates postgres + backend + frontend
├── HOW-TO-RUN.md
│
├── smart-quiz-hub-backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/accenture/smartquiz/
│       │   ├── controller/          # REST endpoints
│       │   ├── service/impl/        # business logic
│       │   ├── repository/          # JPA repositories
│       │   ├── entity/              # JPA entities + enums
│       │   ├── dto/                 # request / response DTOs
│       │   ├── security/            # JWT filter, UserDetails
│       │   ├── config/              # Security, CORS, AI, rate limiters
│       │   └── aspect/              # AOP logging
│       └── resources/
│           ├── application.yml
│           └── db/migration/        # Flyway V1…V9 SQL scripts
│
└── smart-quiz-hub-frontend/
    ├── Dockerfile
    ├── package.json
    ├── proxy.conf.js                # /api → http://backend:8080
    └── src/app/
        ├── core/                    # auth service, guards, HTTP interceptor
        ├── features/                # page-level components (lazy-loaded)
        └── shared/                  # reusable components, pipes, utils
```

---

## API Reference

Base path: `/api` · Full docs at Swagger UI.

| Controller | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/auth` | `POST /login`, `POST /refresh`, `POST /change-password` |
| User | `/users` | `GET /me`, `PUT /me/stacks`, `GET /me/analytics` |
| Stacks | `/stacks` | `GET /` (active), `/admin` CRUD + toggle |
| Questions | `/questions` | CRUD, submit, accept AI, search, bulk-upload, export |
| Reviews | `/reviews` | assign, bulk-assign, auto-assign, decision, pending list |
| AI | `/ai` | `POST /generate`, `POST /duplicate-check`, `POST /review/{id}` |
| Comments | `/questions/{id}/comments` | `GET`, `POST` |
| Notifications | `/notifications` | feed, unread count, mark read, SSE stream |
| Analytics | `/analytics` | overview, SME reports, question stats, workload, CSV export |
| Audit | `/audit` | per-question history, global trail (admin) |
| Admin Users | `/admin/users` | create, update, activate/deactivate, reset-password, delete |

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts with role (SME / ADMIN) and `is_active` flag |
| `technology_stacks` | Skill areas (Spring Boot, Core Java, etc.) |
| `topics` | Sub-topics within a stack |
| `user_stack_mappings` | Many-to-many: user ↔ stack skill assignments |
| `mcq_questions` | Questions with JSONB options, status, AI score, FTS vector |
| `notifications` | In-app notification feed per user |
| `question_comments` | Discussion thread per question |
| `audit_logs` | Immutable mutation history with denormalized author snapshot |

### Flyway Migrations

| Script | What it adds |
|---|---|
| `V1` | Core schema + seed data (6 stacks, 30 topics, 6 users) |
| `V2` | Notifications table + PostgreSQL full-text search vector |
| `V3` | JSONB options + multiple correct answers (replaces fixed A/B/C/D) |
| `V4` | Lifecycle timestamps (`submitted_at`, `assigned_at`, `reviewed_at`, SLA fields) |
| `V5` | Audit trail table |
| `V6` | Question comments table |
| `V7` | Drop FK on audit_logs → users (history survives user deletion) |
| `V9` | `ai_generated` boolean flag on questions |

Reset DB and re-run all migrations: `docker compose down -v && docker compose up`

---

## Architecture Notes

**Security**
- Stateless JWT auth (access: 24 h, refresh: 7 d) · BCrypt strength 12
- Login brute-force protection: 5 failures → 15-minute lockout (per user, in-process)
- CORS restricted to configured origins · SQL injection prevented via JPA + whitelisted sort fields

**Rate Limiting**
- AI endpoints: 10 calls/user/hour (sliding window, in-process)
- Returns remaining count in response; `HTTP 429` when exceeded

**AI Duplicate Detection**
- Spring AI text-embedding-3-small → cosine similarity
- Configurable threshold (default 0.30) and floor (default 0.50) to rescale score to [0, 1]
- Transparent lexical fallback when embedding API is unavailable

**Optimistic Locking**
- `@Version` on `McqQuestion` prevents concurrent edit conflicts

**Real-Time Notifications**
- SSE stream with JWT via query param (browser `EventSource` cannot send headers)
- In-memory emitter registry (resets on restart)

**Virtual Threads**
- `spring.threads.virtual.enabled: true` — Tomcat runs on Java 21 virtual threads for high-concurrency bulk upload and AI generation

**Visibility Rules** (enforced at service layer)
- Creator sees own questions · Reviewer sees assigned questions · Admin sees all

---

## Default Users (seeded by V1 migration)

| Enterprise ID | Role | Password |
|---|---|---|
| `ADMIN001` | ADMIN | `Admin@123` |
| `SME001`–`SME005` | SME | `Sme@12345` |
