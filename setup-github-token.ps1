# Quick GitHub Token Setup Script for RepoScope
Write-Host "🔧 GitHub Token Setup for RepoScope" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`n⚠️  Current Issue:" -ForegroundColor Yellow
Write-Host "   - API endpoints are returning 404/500 errors" -ForegroundColor White
Write-Host "   - GitHub token is not configured" -ForegroundColor White

Write-Host "`n📝 Steps to fix:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/settings/tokens/new" -ForegroundColor Cyan
Write-Host "2. Create a token with these permissions:" -ForegroundColor White
Write-Host "   ✓ repo (Full repository access)" -ForegroundColor Green
Write-Host "   ✓ user (User profile access)" -ForegroundColor Green
Write-Host "3. Copy your token and paste it below" -ForegroundColor White

Write-Host "`n🔑 Enter your GitHub token:" -ForegroundColor Yellow
$token = Read-Host "GitHub Token"

if ([string]::IsNullOrWhiteSpace($token) -or $token -eq "your_github_token_here") {
    Write-Host "`n❌ Invalid token. Please try again with a real GitHub token." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Updating configuration files..." -ForegroundColor Yellow

# Update root .env file
$rootEnvPath = ".\.env"
if (Test-Path $rootEnvPath) {
    $content = Get-Content $rootEnvPath -Raw
    $content = $content -replace "GITHUB_TOKEN=your_github_token_here", "GITHUB_TOKEN=$token"
    Set-Content $rootEnvPath $content -NoNewline
    Write-Host "✅ Updated /.env" -ForegroundColor Green
} else {
    Write-Host "❌ /.env file not found" -ForegroundColor Red
}

# Update Server .env file
$serverEnvPath = ".\Server\.env"
if (Test-Path $serverEnvPath) {
    $content = Get-Content $serverEnvPath -Raw
    $content = $content -replace "GITHUB_TOKEN=your_github_token_here", "GITHUB_TOKEN=$token"
    Set-Content $serverEnvPath $content -NoNewline
    Write-Host "✅ Updated /Server/.env" -ForegroundColor Green
} else {
    Write-Host "❌ /Server/.env file not found" -ForegroundColor Red
}

Write-Host "`n🚀 Configuration updated! Now restart Docker Compose:" -ForegroundColor Green
Write-Host "   docker-compose down" -ForegroundColor Cyan
Write-Host "   docker-compose up --build" -ForegroundColor Cyan

Write-Host "`n✨ After restart, these should work:" -ForegroundColor Yellow
Write-Host "   - Featured repositories will load" -ForegroundColor White
Write-Host "   - Repository file browsing will work" -ForegroundColor White
Write-Host "   - API endpoints will return data instead of errors" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
