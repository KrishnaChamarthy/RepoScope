# RepoScope Setup Guide

##4. Copy the token and replace `your_github_token_here` in both:
   - `/.env`
   - `/Server/.env`
5. **Restart Docker Compose:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### 2. Create GitHub OAuth App (Optional - for user authentication)ronment Configuration Complete ✅

The following issues have been resolved:
- ✅ Created missing `Server/.env` file
- ✅ Generated secure JWT and Session secrets
- ✅ Created root-level `.env` file for Docker Compose variables
- ✅ Removed obsolete `version` field from `compose.yaml`
- ✅ Enhanced Ollama configuration with resource limits

## ⚠️ **IMPORTANT: GitHub Token Required**

**The application will not work properly without a valid GitHub token!** 

Current Status: **GitHub Token Missing** ❌
- API endpoints returning 404/500 errors
- Featured repositories failing to load  
- Repository file browsing not working

## ✅ **Quick Fix - Set Your GitHub Token**

### 1. Get a GitHub Personal Access Token (Required)
1. Go to https://github.com/settings/tokens/new
2. Give it a descriptive name like "RepoScope Token"
3. Select these permissions:
   - `repo` (Full repository access)
   - `user` (User profile access)
4. Click "Generate token"
5. Copy the token and replace `your_github_token_here` in both:
   - `/.env`
   - `/Server/.env`

### 2. Create GitHub OAuth App (Optional - for user authentication)
1. Go to https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: RepoScope
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Click "Register application"
4. Copy the Client ID and Client Secret
5. Update `Server/.env`:
   - Replace `your_github_client_id_here` with your Client ID
   - Replace `your_github_client_secret_here` with your Client Secret

## Starting the Application

Once you've set your GitHub token, you can start the application:

```bash
docker-compose up --build
```

## Services

The application will start these services:
- **Frontend**: http://localhost:5173 (React/Vite)
- **Backend API**: http://localhost:3000 (Express.js)
- **PostgreSQL**: localhost:5432 (Database)
- **Elasticsearch**: http://localhost:9200 (Search engine)
- **Kibana**: http://localhost:5601 (Elasticsearch UI - dev profile only)
- **Ollama**: http://localhost:11434 (AI/LLM service)

## Troubleshooting

- If you see "GITHUB_TOKEN is not set" warnings, make sure you've updated the `.env` files with your actual token
- If services fail to start, check the logs with `docker-compose logs <service-name>`
- For Ollama models, they will be downloaded on first use

## File Structure
```
/.env                     # Docker Compose environment variables
/Server/.env              # Backend server environment variables  
/Server/.env.example      # Template for Server/.env
/compose.yaml            # Main Docker Compose configuration (used by default)
/docker-compose.yml      # Alternative compose file (not used by default)
```
