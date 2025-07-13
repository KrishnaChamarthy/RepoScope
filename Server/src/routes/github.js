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

// Get repository file tree
router.get('/repo/:owner/:name/files', async (req, res) => {
  const { owner, name } = req.params;
  
  try {
    const ghRes = await axios.get(
      `https://api.github.com/repos/${owner}/${name}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    
    // Build file tree structure
    const files = buildFileTree(ghRes.data.tree);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repository files' });
  }
});

// Get specific file content
router.get('/repo/:owner/:name/file', async (req, res) => {
  const { owner, name } = req.params;
  const { path } = req.query;
  
  try {
    const ghRes = await axios.get(
      `https://api.github.com/repos/${owner}/${name}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    
    // Decode base64 content
    const content = Buffer.from(ghRes.data.content, 'base64').toString('utf-8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// Clone and analyze repository from URL
router.post('/clone', async (req, res) => {
  const { repoUrl } = req.body;
  
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }
  
  // Validate GitHub URL
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/;
  const match = repoUrl.match(githubUrlRegex);
  
  if (!match) {
    return res.status(400).json({ error: 'Invalid GitHub URL format' });
  }
  
  const [, owner, repoName] = match;
  const cleanRepoName = repoName.replace('.git', '');
  
  try {
    // First, get repository metadata from GitHub API
    const ghRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepoName}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    const repoData = ghRes.data;
    
    // Clone the repository
    const { cloneRepo } = await import('../services/gitService.js');
    const clonePath = await cloneRepo(repoUrl);
    
    // Analyze the repository structure and complexity
    const { analyzeProject } = await import('../services/parseService.js');
    const analysis = await analyzeProject(clonePath);
    
    // Get enhanced AI insights
    let aiInsights = analysis.insights;
    try {
      const { analyzeRepository } = await import('../services/llmService.js');
      const repoAnalysisData = {
        name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        languageStats: analysis.languageStats,
        projectType: analysis.projectType,
        frameworks: analysis.frameworks,
        buildTools: analysis.buildTools,
        fileStructure: analysis.fileStructure?.slice(0, 20),
        totalFiles: analysis.totalFiles,
        totalLines: analysis.totalLines
      };
      
      const enhancedInsights = await analyzeRepository(repoAnalysisData);
      if (enhancedInsights) {
        aiInsights = enhancedInsights;
      }
    } catch (llmError) {
      console.warn('Failed to generate enhanced AI insights:', llmError.message);
    }
    
    // Combine GitHub metadata with analysis
    const enrichedRepo = {
      id: repoData.id,
      name: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      language: repoData.language,
      lastUpdated: new Date(repoData.updated_at).toLocaleString(),
      complexity: analysis.complexity || 'Medium',
      aiInsights: aiInsights,
      clonePath: clonePath,
      fileStructure: analysis.fileStructure,
      languageStats: analysis.languageStats,
      projectType: analysis.projectType,
      frameworks: analysis.frameworks,
      buildTools: analysis.buildTools,
      isUserRepo: true
    };
    
    // Optional: Clean up cloned repository after analysis (uncomment if you want to save disk space)
    // const { cleanupRepo } = await import('../services/gitService.js');
    // setTimeout(() => cleanupRepo(clonePath), 30000); // Clean up after 30 seconds
    
    res.json({ repo: enrichedRepo });
  } catch (err) {
    console.error('Failed to clone repository:', err);
    res.status(500).json({ error: 'Failed to clone and analyze repository' });
  }
});

// Helper function to build file tree
function buildFileTree(items) {
  const tree = [];
  const folders = {};
  
  items.forEach(item => {
    const parts = item.path.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      if (isLast) {
        current.push({
          name: part,
          type: item.type,
          path: item.path
        });
      } else {
        let folder = current.find(f => f.name === part && f.type === 'dir');
        if (!folder) {
          folder = {
            name: part,
            type: 'dir',
            children: []
          };
          current.push(folder);
        }
        current = folder.children;
      }
    }
  });
  
  return tree;
}

export default router;