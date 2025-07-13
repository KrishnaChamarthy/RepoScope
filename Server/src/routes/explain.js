import express from 'express';
import { explainCode, answerRepositoryQuestion, generateCodeInsights } from '../services/llmService.js';
import path from 'path';

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, filePath, projectIndex, repoName, language, projectType } = req.body;

  try {
    // Enhanced context for better explanations
    const context = {
      filename: filePath ? path.basename(filePath) : undefined,
      language: language || getLanguageFromPath(filePath),
      repoName: repoName,
      projectType: projectType
    };
    
    const explanation = await explainCode(code, context);
    res.json({ success: true, explanation });
  } catch (error) {
    console.error('LLM Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New route for comprehensive code insights
router.post('/insights', async (req, res) => {
  const { codeSnippets, repoContext } = req.body;

  if (!codeSnippets || !Array.isArray(codeSnippets)) {
    return res.status(400).json({ error: 'Code snippets array is required' });
  }

  try {
    const insights = await generateCodeInsights(codeSnippets, repoContext);
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Code Insights Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function getLanguageFromPath(filePath) {
  if (!filePath) return 'Unknown';
  
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.js': 'JavaScript',
    '.jsx': 'React (JSX)',
    '.ts': 'TypeScript',
    '.tsx': 'React (TSX)',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.cs': 'C#',
    '.css': 'CSS',
    '.html': 'HTML',
    '.json': 'JSON',
    '.md': 'Markdown'
  };
  
  return langMap[ext] || 'Unknown';
}

router.post('/ask-repository', async (req, res) => {
  const { owner, repo, question, projectIndex } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    let prompt;
    
    if (projectIndex) {
      const projectContext = buildFullProjectContext(projectIndex, owner, repo);
      prompt = `${projectContext}

User Question: ${question}

Please provide a comprehensive answer based on the project structure and code above.`;
    } else {
      prompt = `Repository: ${owner}/${repo}

Question: ${question}

Please provide a helpful answer about this repository.`;
    }

    const answer = await answerRepositoryQuestion(prompt);

    res.json({
      success: true,
      answer,
      hasProjectIndex: !!projectIndex
    });
  } catch (err) {
    console.error('Error answering repository question:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate answer',
    });
  }
});

function buildProjectContext(projectIndex, filePath) {
  if (!projectIndex) return '';
  
  const { structure, codeAnalysis, summary } = projectIndex;
  
  return `PROJECT CONTEXT:
Repository Summary:
- Total Files: ${summary.totalFiles}
- Languages: ${summary.languages.join(', ')}
- Main Entry Points: ${summary.mainEntryPoints.join(', ')}

Current File: ${filePath}
`;
}

function buildFullProjectContext(projectIndex, owner, repo) {
  if (!projectIndex) return '';
  
  const { structure, codeAnalysis, summary } = projectIndex;
  
  return `COMPLETE PROJECT ANALYSIS for ${owner}/${repo}:

PROJECT OVERVIEW:
- Repository: ${owner}/${repo}
- Total Files Analyzed: ${summary.totalFiles}
- Programming Languages: ${summary.languages.join(', ')}
- Main Entry Points: ${summary.mainEntryPoints.join(', ')}

STATISTICS:
- Functions Found: ${summary.totalFunctions}
- Classes Found: ${summary.totalClasses}
- React Components: ${summary.totalComponents}
`;
}

export default router;