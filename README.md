# Smart Quiz Hub

AI-powered MCQ quiz platform built with Spring Boot, Angular, and PostgreSQL.

---

## Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Backend  | Java 21 · Spring Boot 3.3.4 · Maven   |
| Frontend | Angular 21 · Tailwind CSS · Chart.js  |
| Database | PostgreSQL 16 · Flyway migrations     |
| AI       | Groq (OpenAI-compatible) — free tier  |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)
- Git

That's it. You do **not** need Java, Node, or Maven installed locally.

---

## Quick Start (Docker — recommended)

```bash
# 1. Clone the repo
git clone <repo-url>
cd Hack-N-Stack-Level2

# 2. Set up your environment file
cp .env .env.backup          # optional backup
# Open .env and set your Groq API key:
#   OPENAI_API_KEY=gsk_your_key_here
# Get a free key at https://console.groq.com/keys

# 3. Build images and start all containers
docker compose up --build
```

Wait ~2–4 minutes on first run (Maven downloads dependencies, npm installs packages). Subsequent starts take ~30 seconds.

### Service URLs

| Service         | URL                                                   |
|-----------------|-------------------------------------------------------|
| Frontend        | http://localhost:4200                                 |
| Backend API     | http://localhost:8080/api                             |
| Swagger UI      | http://localhost:8080/api/swagger-ui.html             |
| Actuator Health | http://localhost:8080/api/actuator/health             |
| PostgreSQL      | localhost:5432 · DB: `smart_quiz_hub`                 |

---

## Hot Reload (Change Code Without Rebuilding Images)

### Frontend — instant HMR
Just save a `.ts`, `.html`, or `.scss` file. Angular CLI detects the change and the browser updates **without a page reload**.

### Backend — ~2–3 s restart
Spring Boot DevTools watches `target/classes` for changed `.class` files. Your IDE must compile on save:

**IntelliJ IDEA**
> Settings → Build → Compiler → ✓ *Build project automatically*
> Also enable: Registry (`Ctrl+Shift+A` → "Registry") → ✓ `compiler.automake.allow.when.app.running`

**VS Code** (with Java extension pack)
> Open Settings → search "Java: Auto Build" → set to `on`
> Or manually: `Ctrl+Shift+P` → *Java: Rebuild Project*

**How it works:** You save `.java` → IDE compiles → `.class` written to `target/classes` → volume mount shares it with the container → DevTools detects the change → Spring context restarts in ~2–3 s. **No image rebuild needed.**

---

## Running Without Docker (Local Dev)

### 1. PostgreSQL
Install and start PostgreSQL locally, then create the database:
```sql
CREATE DATABASE smart_quiz_hub;
```

### 2. Backend
```bash
cd smart-quiz-hub-backend

# These three are required — the app will not start without them
export DB_PASSWORD=your_postgres_password
export OPENAI_API_KEY=gsk_your_groq_key
export JWT_SECRET=$(openssl rand -base64 48)

# Optional overrides (defaults work for local PostgreSQL on localhost:5432)
# export DB_URL=jdbc:postgresql://localhost:5432/smart_quiz_hub
# export DB_USERNAME=postgres

mvn spring-boot:run
# API available at http://localhost:8080/api
```

### 3. Frontend
```bash
cd smart-quiz-hub-frontend
npm install
npm start
# App available at http://localhost:4200
# proxy.conf.js forwards /api → http://localhost:8080 automatically
```

---

## Environment Variables

All variables live in `.env` at the project root. The file is gitignored — never commit it.

| Variable                 | Default                          | Description                             |
|--------------------------|----------------------------------|-----------------------------------------|
| `DB_NAME`                | `smart_quiz_hub`                 | PostgreSQL database name                |
| `DB_USERNAME`            | `postgres`                       | PostgreSQL user                         |
| `DB_PASSWORD`            | *(required — no default)*        | PostgreSQL password                     |
| `DB_PORT`                | `5433`                           | Host port (use 5433 if 5432 is taken)   |
| `BACKEND_PORT`           | `8080`                           | Host port for Spring Boot               |
| `FRONTEND_PORT`          | `4200`                           | Host port for Angular dev server        |
| `JWT_SECRET`             | *(required — no default)*        | 256-bit secret for signing JWTs         |
| `BACKEND_URL`            | `http://backend:8080`            | Backend target for Angular proxy        |
| `JWT_EXPIRATION_MS`      | `86400000` (24 h)                | Token validity in milliseconds          |
| `OPENAI_API_KEY`         | *(required — no default)*        | Groq API key (starts with `gsk_`)       |
| `OPENAI_BASE_URL`        | `https://api.groq.com/openai`    | AI provider base URL                    |
| `OPENAI_MODEL`           | `llama-3.3-70b-versatile`        | Chat model name                         |
| `AI_EMBEDDINGS_ENABLED`  | `true`                           | Enable AI duplicate detection           |
| `AI_SIMILARITY_THRESHOLD`| `0.30`                           | Block duplicate if similarity ≥ this    |
| `CORS_ALLOWED_ORIGINS`   | `http://localhost:4200`          | Allowed frontend origin(s)              |

---

## Common Docker Commands

```bash
# Start all containers (detached — runs in background)
docker compose up -d

# View logs
docker compose logs -f                  # all services
docker compose logs -f backend          # backend only
docker compose logs -f frontend         # frontend only
docker compose logs -f postgres         # postgres only

# Open a shell inside a container
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec postgres psql -U postgres smart_quiz_hub

# Stop containers (data is preserved in Docker volumes)
docker compose down

# Stop and wipe all data (fresh database on next start)
docker compose down -v

# Rebuild a single image (needed when pom.xml or package.json changes)
docker compose build backend
docker compose build frontend
docker compose up -d --no-deps backend  # restart only backend after rebuild

# Check container health
docker compose ps
```

---

## Project Structure

```
Hack-N-Stack-Level2/
├── .env                          # secrets & config (gitignored)
├── docker-compose.yml            # container orchestration
│
├── smart-quiz-hub-backend/
│   ├── Dockerfile                # Maven + Java 21 dev container
│   ├── pom.xml                   # Maven dependencies
│   └── src/
│       └── main/
│           ├── java/com/accenture/smartquiz/
│           │   ├── controller/   # REST endpoints
│           │   ├── service/      # business logic
│           │   ├── repository/   # JPA repositories
│           │   ├── entity/       # JPA entities
│           │   ├── dto/          # request / response DTOs
│           │   ├── security/     # JWT auth
│           │   └── config/       # Spring configs (CORS, Security, AI)
│           └── resources/
│               ├── application.yml
│               └── db/migration/ # Flyway SQL scripts (V1, V2, V3)
│
└── smart-quiz-hub-frontend/
    ├── Dockerfile                # Node 22 + Angular CLI dev container
    ├── package.json
    └── src/
        ├── app/
        │   ├── core/             # services, guards, interceptors
        │   ├── features/         # page-level feature modules
        │   └── shared/           # reusable components & pipes
        └── environments/
            ├── environment.ts        # dev  → http://localhost:8080/api
            └── environment.prod.ts   # prod → /api  (relative)
```

---

## Database Migrations

Flyway runs automatically on backend startup. Migration scripts are in `src/main/resources/db/migration/`:

| Script              | Description                                  |
|---------------------|----------------------------------------------|
| `V1__init.sql`      | Core schema: users, stacks, topics, MCQs     |
| `V2__level3_features.sql` | Notifications, full-text search, optimistic locking |
| `V3__multi_option_mcq.sql` | JSONB options array, multiple correct answers |

To reset the DB and re-run all migrations: `docker compose down -v && docker compose up`.

---

## Troubleshooting

**Backend won't start — `Connection refused` to PostgreSQL**
> PostgreSQL health-check isn't passing yet. Wait 10–15 s and check: `docker compose logs postgres`

**`Port 5432 already in use`**
> `.env` already sets `DB_PORT=5433` to avoid this. The Docker container uses 5433 on the host and 5432 internally — no conflict.
> If you still see this, check: `sudo lsof -i :5432` and stop what's there, or pick another port in `.env`.

**`Port 8080 / 4200 already in use`**
> Change `BACKEND_PORT` or `FRONTEND_PORT` in `.env`.

**Backend changes not hot-reloading**
> Make sure your IDE auto-compile is on (see Hot Reload section above).
> Verify `target/classes` is being updated: `ls -la smart-quiz-hub-backend/target/classes`

**Frontend changes not showing**
> The container uses `--poll 2000` for reliable file-watching in Docker.
> If changes still don't show, force reload the browser (`Ctrl+Shift+R`).

**Added a new npm package and it's not available in the container**
> `npm install` on the host only updates `package.json` and `node_modules` locally.
> You must rebuild the frontend image: `docker compose build frontend && docker compose up -d frontend`

**Want to switch from Groq to real OpenAI**
> In `.env`:
> ```
> OPENAI_API_KEY=sk-your-openai-key
> OPENAI_BASE_URL=https://api.openai.com
> OPENAI_MODEL=gpt-4o-mini
> ```

---

## Generating a Strong JWT Secret

```bash
openssl rand -base64 48
```

Paste the output into `.env` as `JWT_SECRET`.
