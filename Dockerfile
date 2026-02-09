# Multi-stage Dockerfile for mALIGNa
# Bilingual sentence alignment tool

# ============================================
# Stage 1: Build stage
# ============================================
FROM maven:3.9-eclipse-temurin-11 AS builder

WORKDIR /build

# Copy pom files first for better layer caching
COPY maligna/pom.xml maligna/pom.xml
COPY maligna-ui/pom.xml maligna-ui/pom.xml

# Download dependencies (cached layer if pom files don't change)
RUN cd maligna && mvn dependency:go-offline -Dmaven.compiler.release=11 -B || true
RUN cd maligna-ui && mvn dependency:go-offline -Dmaven.compiler.release=11 -B || true

# Copy source files
COPY maligna/src maligna/src
COPY maligna-ui/src maligna-ui/src
COPY maligna-ui/examples maligna-ui/examples
COPY README.md LICENSE.txt CHANGELOG.md ./

# Build the maligna core library and install to local repo
RUN cd maligna && mvn clean install -Dmaven.compiler.release=11 -DskipTests -Dgpg.skip=true -B

# Build the maligna-ui and create the distribution package
RUN cd maligna-ui && mvn clean package -Dmaven.compiler.release=11 -DskipTests -B

# Install unzip and extract the distribution
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*
RUN cd maligna-ui/target && \
    unzip maligna-*.zip -d /app-dist && \
    mv /app-dist/maligna-* /app

# ============================================
# Stage 2: Runtime stage
# ============================================
FROM eclipse-temurin:11-jre-alpine

LABEL maintainer="Jarek Lipski <pub@loomchild.net>"
LABEL description="mALIGNa - Bilingual sentence aligner"
LABEL version="3.0.2"

# Install bash for script compatibility
RUN apk add --no-cache bash

# Create non-root user for security
RUN addgroup -g 1000 maligna && \
    adduser -u 1000 -G maligna -s /bin/bash -D maligna

# Copy the built application
COPY --from=builder /app /opt/maligna

# Fix script permissions and line endings
RUN chmod +x /opt/maligna/bin/maligna && \
    sed -i 's/\r$//' /opt/maligna/bin/maligna

# Create a wrapper script for easier usage
RUN echo '#!/bin/bash' > /usr/local/bin/maligna && \
    echo 'exec /opt/maligna/bin/maligna "$@"' >> /usr/local/bin/maligna && \
    chmod +x /usr/local/bin/maligna

# Create working directory for user files
WORKDIR /data
RUN chown maligna:maligna /data

# Switch to non-root user
USER maligna

# Set environment variables
ENV PATH="/opt/maligna/bin:${PATH}"

# Default command - show help
CMD ["maligna", "-h"]
