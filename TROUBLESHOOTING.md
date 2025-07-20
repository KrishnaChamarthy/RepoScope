# RepoScope Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: API Endpoints Returning 404 Errors
```
:3000/auth/github/user:1 Failed to load resource: 404 (Not Found)
:3000/github/featured:1 Failed to load resource: 404 (Not Found)  
:3000/github/repo/.../files:1 Failed to load resource: 404 (Not Found)
```

**Root Cause:** Missing or invalid GitHub Personal Access Token

**Solution:**
1. Run the setup script: `.\setup-github-token.ps1`
2. Or manually update both `.env` and `Server\.env` files
3. Restart Docker: `docker-compose down && docker-compose up --build`

### Issue 2: GitHub API Authentication Errors
```
GitHub featured fetch failed: { message: 'Bad credentials' }
```

**Root Cause:** GitHub token is still set to placeholder value

**Solution:** Same as Issue 1 above

### Issue 3: Client Can't Connect to Backend
```
BASE_API_URL: http://localhost:3000
AxiosError: Network Error
```

**Check:**
1. Backend container running: `docker ps | findstr api`
2. Backend logs: `docker logs reposcope-api-1`
3. Health check: `curl http://localhost:3000/api/health`

### Issue 4: Environment Variables Not Loading

**Client Side:**
- Variables must start with `VITE_` prefix
- Restart Vite dev server after changes
- Check: `Client\.env` file exists

**Server Side:**
- Check: `Server\.env` file exists  
- Restart Docker containers after changes
- Verify in container: `docker exec reposcope-api-1 printenv | findstr GITHUB`

## 🔍 Diagnostic Commands

```bash
# Check running containers
docker ps

# Check API logs
docker logs reposcope-api-1 --tail 20

# Test health endpoint
curl http://localhost:3000/api/health

# Test GitHub endpoints (should work after token setup)
curl http://localhost:3000/api/github/featured

# Check environment variables in container
docker exec reposcope-api-1 printenv | findstr -E "(GITHUB|NODE_ENV|DATABASE)"
```

## ⚡ Quick Reset

If all else fails:
```bash
docker-compose down -v
docker-compose up --build
```

## 📞 Still Having Issues?

1. Check the main `SETUP.md` file
2. Ensure all `.env` files are properly configured
3. Verify Docker and Docker Compose are running
4. Check that ports 3000, 5173, 5432, 9200, 11434 are not in use by other applications
