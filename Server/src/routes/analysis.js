import express from 'express';
import axios from 'axios';
import { parseGitHubUrl } from '../services/gitService.js';

const router = express.Router();

// Get repository analysis data for AnalyzePage
router.get('/repo/:owner/:repo/analysis', async (req, res) => {
  const { owner, repo } = req.params;
  
  try {
    // First, get basic repository information from GitHub API
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    const repoData = repoRes.data;
    
    // Get language statistics from GitHub API
    const languagesRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    // Get contributor count
    const contributorsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    // Get file tree to calculate basic structure stats
    const filesRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    
    const files = filesRes.data.tree || [];
    
    // Analyze languages and calculate distribution
    const languages = languagesRes.data || {};
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languageDistribution = Object.entries(languages)
      .map(([lang, bytes]) => ({
        name: lang,
        percentage: Math.round((bytes / totalBytes) * 100),
        bytes
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    // Analyze file structure
    const fileTypes = {};
    let totalFiles = 0;
    let sourceFiles = 0;
    let testFiles = 0;
    let configFiles = 0;
    let documentationFiles = 0;
    
    files.forEach(file => {
      if (file.type === 'blob') {
        totalFiles++;
        const fileName = file.path.toLowerCase();
        const ext = fileName.split('.').pop();
        
        // Categorize files
        if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'scala', 'swift'].includes(ext)) {
          sourceFiles++;
        }
        
        if (fileName.includes('test') || fileName.includes('spec') || fileName.includes('__test__') || fileName.includes('.test.') || fileName.includes('.spec.')) {
          testFiles++;
        }
        
        if (['json', 'yaml', 'yml', 'toml', 'ini', 'conf', 'config', 'env'].includes(ext) || fileName.includes('config')) {
          configFiles++;
        }
        
        if (['md', 'txt', 'rst', 'doc', 'docx'].includes(ext) || fileName.includes('readme') || fileName.includes('license')) {
          documentationFiles++;
        }
        
        // Count file extensions
        if (ext) {
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }
    });
    
    // Estimate complexity based on repository characteristics
    let complexity = 'Low';
    const complexityScore = 
      (totalFiles > 100 ? 2 : totalFiles > 50 ? 1 : 0) +
      (languageDistribution.length > 3 ? 2 : languageDistribution.length > 1 ? 1 : 0) +
      (contributorsRes.data.length > 10 ? 2 : contributorsRes.data.length > 3 ? 1 : 0) +
      (repoData.open_issues_count > 50 ? 1 : 0);
    
    if (complexityScore >= 6) complexity = 'High';
    else if (complexityScore >= 3) complexity = 'Medium';
    
    // Detect project type and frameworks
    let projectType = 'General';
    const frameworks = [];
    
    // Check for specific files that indicate frameworks/project types
    const hasPackageJson = files.some(f => f.path === 'package.json');
    const hasRequirementsTxt = files.some(f => f.path === 'requirements.txt');
    const hasDockerfile = files.some(f => f.path.toLowerCase().includes('dockerfile'));
    const hasNextConfig = files.some(f => f.path.includes('next.config'));
    const hasViteConfig = files.some(f => f.path.includes('vite.config'));
    const hasTailwindConfig = files.some(f => f.path.includes('tailwind.config'));
    
    if (hasPackageJson && (languages.JavaScript || languages.TypeScript)) {
      if (hasNextConfig) {
        projectType = 'Next.js Application';
        frameworks.push('Next.js', 'React');
      } else if (files.some(f => f.path.includes('.jsx') || f.path.includes('.tsx'))) {
        projectType = 'React Application';
        frameworks.push('React');
      } else {
        projectType = 'JavaScript/Node.js Project';
      }
      
      if (hasViteConfig) frameworks.push('Vite');
      if (hasTailwindConfig) frameworks.push('Tailwind CSS');
    } else if (hasRequirementsTxt && languages.Python) {
      projectType = 'Python Project';
      frameworks.push('Python');
    }
    
    if (hasDockerfile) frameworks.push('Docker');
    
    // Generate AI insights placeholder (can be enhanced with actual AI analysis)
    const aiInsights = `This ${projectType.toLowerCase()} contains ${totalFiles} files across ${languageDistribution.length} programming languages. ` +
      `The primary language is ${languageDistribution[0]?.name || 'unknown'} (${languageDistribution[0]?.percentage || 0}%). ` +
      `${frameworks.length > 0 ? `Built with ${frameworks.join(', ')}.` : ''} ` +
      `The project has ${complexity.toLowerCase()} complexity with ${contributorsRes.data.length} contributors.`;
    
    // Build response
    const analysis = {
      // Basic repository info
      repository: {
        id: repoData.id,
        name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues_count,
        lastUpdated: repoData.updated_at,
        complexity: complexity,
        projectType: projectType,
        frameworks: frameworks
      },
      
      // Code structure statistics
      codeStructure: {
        totalFiles: totalFiles,
        sourceFiles: sourceFiles,
        testFiles: testFiles,
        configFiles: configFiles,
        documentationFiles: documentationFiles,
        // Estimated functions/classes based on source files and complexity
        estimatedFunctions: sourceFiles * (complexity === 'High' ? 25 : complexity === 'Medium' ? 15 : 10),
        estimatedClasses: sourceFiles * (complexity === 'High' ? 8 : complexity === 'Medium' ? 5 : 3),
        estimatedLines: Object.values(languages).reduce((sum, bytes) => sum + Math.floor(bytes / 25), 0) // Rough estimate: 25 bytes per line
      },
      
      // Language distribution
      languageDistribution: languageDistribution,
      
      // Repository statistics
      stats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues_count,
        contributors: contributorsRes.data.length,
        lastUpdated: new Date(repoData.updated_at).toLocaleString(),
        createdAt: new Date(repoData.created_at).toLocaleString(),
        size: repoData.size // Size in KB
      },
      
      // AI insights
      aiInsights: {
        summary: aiInsights,
        projectType: projectType,
        frameworks: frameworks,
        complexity: complexity,
        recommendations: [
          testFiles > 0 ? 'Good test coverage detected' : 'Consider adding more tests',
          documentationFiles > 0 ? 'Well documented project' : 'Consider improving documentation',
          complexity === 'High' ? 'Complex project - consider modularization' : 'Well-structured project'
        ]
      }
    };
    
    res.json({ success: true, analysis });
    
  } catch (error) {
    console.error('Repository analysis error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze repository',
      details: error.message 
    });
  }
});

export default router;
