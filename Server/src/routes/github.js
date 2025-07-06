import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/repos', async (req, res) => {
  if (!req.isAuthenticated() || !req.user?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const ghRes = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    res.json({ repos: ghRes.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

// Featured repositories endpoint
router.get('/featured', async (req, res) => {
  const featured = [
    'facebook/react',
    'vercel/next.js',
    'microsoft/vscode',
    'torvalds/linux',
    'twbs/bootstrap'
  ];

  try {
    const results = await Promise.all(
      featured.map(async (fullName) => {
        const ghRes = await axios.get(`https://api.github.com/repos/${fullName}`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`, // <-- use token
            Accept: 'application/vnd.github.v3+json',
          },
        });
        return ghRes.data;
      })
    );
    res.json({ repos: results });
  } catch (err) {
    console.error('GitHub featured fetch failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch featured repositories' });
  }
});


export default router;