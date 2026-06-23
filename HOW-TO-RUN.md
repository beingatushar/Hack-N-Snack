# How to Run

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose

## Steps

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env — fill in DB_PASSWORD, JWT_SECRET, and OPENAI_API_KEY (free at console.groq.com)

# 2. Start
docker compose up --build
```

## Access

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:4200        |
| Backend  | http://localhost:8080        |
| API Docs | http://localhost:8080/swagger-ui/index.html |

## Stop

```bash
docker compose down        # stop
docker compose down -v     # stop + delete database
```
