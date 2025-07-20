import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import repoRoutes from './routes/repo.js';
import searchRoutes from './routes/search.js';
import explainRoutes from './routes/explain.js';
import analysisRoutes from './routes/analysis.js';
import session from 'express-session';
import passport from 'passport';
import githubAuthRoutes from './auth/github.js';
import githubRoutes from './routes/github.js';
import { checkOllamaHealth, preloadModels, waitForOllama } from './services/llmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS setup ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// --- Session setup ---
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/repo', repoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/auth', githubAuthRoutes);
app.use('/api/github', githubRoutes);

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const ollamaHealthy = await checkOllamaHealth(1);
    const responseTime = Date.now() - startTime;
    
    res.json({
      status: 'ok',
      ollama: ollamaHealthy ? 'connected' : 'disconnected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
        memoryUsage: process.memoryUsage(),
        cpuArch: process.arch,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add this health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const ollamaHealthy = await checkOllamaHealth(1);
    res.json({
      status: 'ok',
      ollama: ollamaHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      ollama: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'RepoScope API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      repo: '/api/repo',
      search: '/api/search',
      explain: '/api/explain',
      auth: '/api/auth',
      github: '/api/github'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server with optimized startup sequence
const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🤖 Ollama URL: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
    console.log(`💾 Memory Usage:`, process.memoryUsage());
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  // Wait for Ollama with extended timeout for CPU
  const ollamaReady = await waitForOllama(180000); // 3 minutes timeout for CPU startup
  
  if (ollamaReady) {
    console.log('🤖 Ollama is connected and ready (CPU mode)');
    console.log('🔧 Starting model preloading...');
    await preloadModels();
    console.log('🎉 All systems ready!');
  } else {
    console.log('⚠️ Ollama is not accessible. AI features will be disabled.');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check if Docker is running: docker ps');
    console.log('   2. Check Ollama container: docker-compose logs ollama');
    console.log('   3. Restart services: docker-compose restart ollama');
    console.log('   4. Check memory allocation: docker stats');
  }
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;