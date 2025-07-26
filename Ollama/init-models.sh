#!/bin/bash

# Render-optimized init script for Ollama
set -e

echo "🚀 Starting Ollama for Render deployment..."

# Start Ollama in background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready with longer timeout for Render
echo "⏳ Waiting for Ollama to be ready (may take a few minutes on Render)..."
for i in {1..60}; do
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama is ready!"
        break
    fi
    echo "  Attempt $i/60 - still waiting..."
    sleep 5
done

# Function to pull model with retries
pull_model() {
    local model=$1
    local max_retries=2
    local retry=0
    
    echo "📥 Pulling model: $model"
    
    while [ $retry -lt $max_retries ]; do
        if timeout 300 ollama pull "$model"; then
            echo "✅ Successfully pulled $model"
            return 0
        else
            retry=$((retry + 1))
            echo "❌ Failed to pull $model (attempt $retry/$max_retries)"
            if [ $retry -lt $max_retries ]; then
                echo "🔄 Retrying in 30 seconds..."
                sleep 30
            fi
        fi
    done
    
    echo "⚠️ Failed to pull $model after $max_retries attempts"
    return 1
}

# Pull models from config file
if [ -f "/usr/local/bin/models.txt" ]; then
    echo "📋 Loading models for Render deployment..."
    while IFS= read -r model || [ -n "$model" ]; do
        if [[ -n "$model" && ! "$model" =~ ^[[:space:]]*# ]]; then
            pull_model "$model"
        fi
    done < "/usr/local/bin/models.txt"
else
    echo "📋 Using default lightweight model for Render..."
    pull_model "llama3.2:1b"
fi

echo "🎉 Ollama initialization complete for Render!"

# Keep running
wait $OLLAMA_PID
