import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import repoRoutes from './routes/repo.js';
import searchRoutes from './routes/search.js';
import explainRoutes from './routes/explain.js';
import session from 'express-session';
import passport from 'passport';
import githubAuthRoutes from './auth/github.js';
import githubRoutes from './routes/github.js';

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

app.use(express.json());

// --- Session setup ---
app.set('trust proxy', 1); // if behind a proxy (e.g., Docker, nginx)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    sameSite: 'lax', // or 'none' if using HTTPS and cross-origin
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/repo', repoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/auth', githubAuthRoutes);
app.use('/api/github', githubRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;