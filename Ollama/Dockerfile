# Render-optimized Ollama Dockerfile for RepoScope
FROM ollama/ollama:latest

# Set environment variables for Render constraints
ENV OLLAMA_KEEP_ALIVE=24h
ENV OLLAMA_HOST=0.0.0.0:11434
ENV OLLAMA_NUM_PARALLEL=1
ENV OLLAMA_MAX_LOADED_MODELS=1
ENV OLLAMA_NUM_THREAD=4

# Create directory for models
RUN mkdir -p /root/.ollama/models

# Copy initialization script
COPY init-models.sh /usr/local/bin/init-models.sh
RUN chmod +x /usr/local/bin/init-models.sh

# Copy lightweight model config for Render
COPY models-render.txt /usr/local/bin/models.txt

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 11434

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:11434/api/tags || exit 1

# Use init script as entrypoint
ENTRYPOINT ["/usr/local/bin/init-models.sh"]
