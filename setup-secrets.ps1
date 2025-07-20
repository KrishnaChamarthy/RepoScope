# PowerShell script to generate secure secrets for RepoScope
Write-Host "Generating secure secrets for RepoScope..." -ForegroundColor Green

# Generate JWT Secret
$jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# Generate Session Secret  
$sessionSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

Write-Host "`nGenerated Secrets:" -ForegroundColor Yellow
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Cyan
Write-Host "SESSION_SECRET=$sessionSecret" -ForegroundColor Cyan

Write-Host "`nTo complete setup:" -ForegroundColor Yellow
Write-Host "1. Replace 'your_jwt_secret_here_replace_with_strong_random_string' with the JWT_SECRET above in both .env files" -ForegroundColor White
Write-Host "2. Replace 'your_session_secret_here_replace_with_strong_random_string' with the SESSION_SECRET above in Server/.env" -ForegroundColor White
Write-Host "3. Get your GitHub token from https://github.com/settings/tokens/new (needs 'repo' and 'user' permissions)" -ForegroundColor White
Write-Host "4. Replace 'your_github_token_here' with your actual GitHub token in both .env files" -ForegroundColor White
Write-Host "5. For GitHub OAuth, create an app at https://github.com/settings/applications/new" -ForegroundColor White
Write-Host "   - Homepage URL: http://localhost:5173" -ForegroundColor White
Write-Host "   - Callback URL: http://localhost:3000/api/auth/github/callback" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
