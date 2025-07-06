import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

const router = express.Router();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Attach accessToken to user profile
      return done(null, { ...profile, accessToken });
    }
  )
);

// Start OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

// OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// Get current user info
router.get('/github/user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout?.(); // for passport >=0.6.0
  req.session?.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

export default router;