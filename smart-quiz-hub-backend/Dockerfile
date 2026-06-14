# =============================================================
# Smart Quiz Hub — Backend (Development)
# =============================================================
# Base image: Maven + Java 21 (Alpine = small)
#
# Hot reload flow:
#   1. Your IDE saves & auto-compiles a .java file on the HOST
#   2. The compiled .class lands in ./target/classes (bind-mounted into container)
#   3. Spring Boot DevTools detects the change and restarts the app in ~2-3 s
#   4. No image rebuild needed
#
# First-run note:
#   Maven downloads all dependencies into the named volume (maven_cache:/root/.m2).
#   This takes a few minutes once. Subsequent starts are fast.
# =============================================================

FROM maven:3.9-eclipse-temurin-21-alpine

WORKDIR /app

# Pre-fetch dependencies at image-build time.
# The image's /root/.m2 seeds the maven_cache named volume on first container start,
# so developers don't wait for a full download every time the image is rebuilt.
COPY pom.xml .
RUN mvn dependency:resolve -B --no-transfer-progress 2>&1 | tail -5 || true

EXPOSE 8080

# -Dspring-boot.run.fork=false  → DevTools restarts run in the same JVM (required for hot reload)
# --no-transfer-progress        → cleaner container logs (no noisy download progress bars)
CMD ["mvn", "spring-boot:run", "--no-transfer-progress", "-Dspring-boot.run.fork=false"]
