Write-Host "🚀 Setting up Ollama with CPU optimization and increased RAM..." -ForegroundColor Green

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Check available system resources
Write-Host "📊 System resources:" -ForegroundColor Blue
$cpu = (Get-WmiObject -Class Win32_ComputerSystem).NumberOfLogicalProcessors
$memory = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
Write-Host "CPU cores: $cpu" -ForegroundColor Cyan
Write-Host "Total Memory: $memory GB" -ForegroundColor Cyan

# Start Docker Compose
Write-Host "📦 Starting Docker containers with CPU optimization..." -ForegroundColor Blue
docker-compose up -d

# Wait for Ollama to be ready
Write-Host "⏳ Waiting for Ollama to be ready (CPU startup takes longer)..." -ForegroundColor Yellow
$attempt = 0
$maxAttempts = 60  # 5 minutes total

do {
    Start-Sleep -Seconds 5
    $response = try { 
        Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 10
        $true 
    } catch { 
        $false 
    }
    $attempt++
    if (-not $response) {
        Write-Host "Waiting for Ollama... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
    }
} while (-not $response -and $attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "❌ Timeout waiting for Ollama" -ForegroundColor Red
    Write-Host "📋 Checking container status:" -ForegroundColor Blue
    docker-compose ps
    Write-Host "📋 Checking logs:" -ForegroundColor Blue
    docker-compose logs --tail=20 ollama
    exit 1
}

Write-Host "✅ Ollama is ready!" -ForegroundColor Green

# Pull only the original model
Write-Host "📥 Pulling Llama 3.2:3b model..." -ForegroundColor Blue
docker exec reposcope-ollama ollama pull llama3.2:3b

# Verify model is installed
Write-Host "📋 Installed models:" -ForegroundColor Blue
docker exec reposcope-ollama ollama list

# Test the model
Write-Host "🧪 Testing model..." -ForegroundColor Blue
docker exec reposcope-ollama ollama run llama3.2:3b "Hello, world!"

# Show resource usage
Write-Host "📊 Current resource usage:" -ForegroundColor Blue
docker stats --no-stream reposcope-ollama

Write-Host "🎉 Setup complete! Ollama is running with Llama 3.2:3b" -ForegroundColor Green
Write-Host "📍 Access Ollama at: http://localhost:11434" -ForegroundColor Cyan
Write-Host "🔍 Monitor performance with: docker stats" -ForegroundColor Cyan
Write-Host "📋 View logs with: docker-compose logs -f ollama" -ForegroundColor Cyan