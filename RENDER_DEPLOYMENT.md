# RepoScope Deployment on Render

This guide helps you deploy RepoScope on Render.com using the provided `render.yaml` configuration.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your RepoScope code should be in a GitHub repository
3. **GitHub OAuth App**: For authentication features

## Deployment Steps

### 1. Connect Repository

1. Go to your Render dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository containing RepoScope
4. Render will automatically detect the `render.yaml` file

### 2. Configure Environment Variables

Set these environment variables in the Render dashboard:

#### Required Variables:
```
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_TOKEN=your_personal_access_token
```

#### Optional Variables:
```
NODE_ENV=production
SESSION_SECRET=auto-generated-by-render
```

### 3. GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: RepoScope
   - **Homepage URL**: `https://your-app-name.onrender.com`
   - **Authorization callback URL**: `https://your-app-name.onrender.com/api/auth/github/callback`
3. Copy the Client ID and Client Secret to Render environment variables

### 4. Deploy

1. Click "Apply" in Render
2. Wait for all services to build and deploy (may take 10-15 minutes)
3. Monitor logs for any issues

## Service Architecture

The deployment creates:

### 🌐 Frontend (`reposcope-frontend`)
- **Type**: Static Site
- **Build**: Vite production build
- **URL**: `https://your-frontend-name.onrender.com`

### 🔧 Backend API (`reposcope-api`)
- **Type**: Web Service
- **Runtime**: Node.js
- **URL**: `https://your-api-name.onrender.com`
- **Health Check**: `/health`

### 🤖 Ollama AI (`reposcope-ollama`)
- **Type**: Private Service
- **Runtime**: Docker
- **Model**: llama3.2:1b (lightweight for Render)
- **Storage**: 10GB persistent disk

### 🗄️ Database (`reposcope-db`)
- **Type**: PostgreSQL
- **Plan**: Starter (optional)

## Resource Plans

### Recommended Plans:

- **Frontend**: Free tier ✅
- **Backend**: Starter ($7/month)
- **Ollama**: Standard ($25/month) - needs more resources for AI
- **Database**: Starter ($7/month) - if using database features

### Cost Optimization:

For minimal cost, you can:
1. Use free tier for frontend
2. Use Starter plan for backend
3. Skip the database if not needed
4. Consider external AI services instead of self-hosted Ollama

## Troubleshooting

### Common Issues:

#### 1. Ollama Service Fails to Start
- **Cause**: Insufficient resources
- **Solution**: Upgrade to Standard plan or use external AI service

#### 2. Build Timeouts
- **Cause**: Ollama model download takes too long
- **Solution**: Use smaller models or pre-built Docker images

#### 3. CORS Issues
- **Cause**: Frontend and backend URLs mismatch
- **Solution**: Update environment variables with correct Render URLs

#### 4. GitHub OAuth Errors
- **Cause**: Incorrect callback URLs
- **Solution**: Update GitHub OAuth app with Render URLs

### Performance Optimization:

1. **Use CDN**: Enable Render's CDN for static assets
2. **Optimize Models**: Use smallest viable AI models
3. **Database Indexing**: Add indexes for frequently queried data
4. **Caching**: Implement Redis for session storage

## Monitoring

### Health Checks:
- **Backend**: `https://your-api.onrender.com/health`
- **Ollama**: Check service logs for model availability

### Logs:
- Access logs through Render dashboard
- Monitor resource usage and response times

## Scaling

### Horizontal Scaling:
- Frontend: Automatically scaled by Render CDN
- Backend: Upgrade plan for more resources
- Ollama: Consider external AI APIs for better scaling

### Database Scaling:
- Start with Starter plan
- Upgrade based on usage patterns

## Alternative AI Configuration

If Ollama is too resource-intensive for your budget, consider:

1. **OpenAI API**: Replace Ollama with OpenAI API calls
2. **Hugging Face**: Use Hugging Face inference endpoints
3. **Replicate**: Use Replicate for on-demand model inference

Update the backend environment variables:
```
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

## Support

For deployment issues:
1. Check Render service logs
2. Review environment variable configuration
3. Verify GitHub OAuth app settings
4. Check resource plan limitations
