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
      // Debug logging to see context quality
      console.log(`🧠 AI Context for ${owner}/${repo}:`, {
        hasProjectIndex: !!projectIndex,
        totalFiles: projectIndex.summary?.totalFiles || 0,
        totalLines: projectIndex.summary?.totalLines || 0,
        hasFullContent: !!(projectIndex.fullContent && Object.keys(projectIndex.fullContent).length > 0),
        fullContentFiles: Object.keys(projectIndex.fullContent || {}).length,
        question: question.substring(0, 100) + (question.length > 100 ? '...' : '')
      });
      
      // Check if we need to use a simplified context for the current model
      const tempContext = buildFullProjectContext(projectIndex, owner, repo);
      const shouldSimplify = tempContext.length > 8000; // Threshold for 3B models
      
      const projectContext = shouldSimplify 
        ? buildSimplifiedProjectContext(projectIndex, owner, repo, question)
        : tempContext;
      
      console.log(`📝 Using ${shouldSimplify ? 'simplified' : 'full'} context: ${projectContext.length} characters`);
      
      prompt = `You are an expert software engineer analyzing the repository ${owner}/${repo}.

${projectContext}

==== USER QUESTION ====
${question}

==== INSTRUCTIONS ====
Answer the question using specific information from the repository analysis above. Reference actual files, functions, and code when possible. Be concise but comprehensive.`;
    } else {
      prompt = `Repository: ${owner}/${repo}

Question: ${question}

Note: Limited project context available. This analysis is based on basic repository information only.

Please provide a helpful answer about this repository, but note that detailed code analysis is not available without full project indexing.`;
    }

    const answer = await answerRepositoryQuestion(prompt);

    res.json({
      success: true,
      answer,
      hasProjectIndex: !!projectIndex,
      contextLevel: projectIndex ? 'comprehensive' : 'basic'
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
  
  const { structure, codeAnalysis, fullContent, fileMetadata, summary } = projectIndex;
  
  // Build context more strategically to avoid overwhelming the AI
  let context = `REPOSITORY ANALYSIS: ${owner}/${repo}

==== OVERVIEW ====
• Files: ${summary.totalFiles || 0} analyzed (${summary.totalLines?.toLocaleString() || 'unknown'} lines)
• Languages: ${summary.languages?.join(', ') || 'Unknown'}
• Dependencies: ${summary.dependencies?.length || 0} packages
• Frameworks: ${summary.frameworks?.join(', ') || 'None detected'}
• Architecture: ${summary.totalClasses || 0} classes, ${summary.totalFunctions || 0} functions, ${summary.totalComponents || 0} components

==== KEY FILES & STRUCTURE ====`;

  // Add the most important files first (package.json, README, main entry points)
  const criticalFiles = [
    ...Object.keys(fullContent || {}).filter(f => f.toLowerCase().includes('package.json')),
    ...Object.keys(fullContent || {}).filter(f => f.toLowerCase().includes('readme')),
    ...(summary.mainEntryPoints || []).slice(0, 3)
  ].slice(0, 5);

  criticalFiles.forEach(filePath => {
    if (fullContent && fullContent[filePath]) {
      const content = fullContent[filePath];
      const analysis = codeAnalysis[filePath];
      const truncated = content.length > 8000 ? content.substring(0, 8000) + '\n... [truncated]' : content;
      
      context += `\n\n--- ${filePath} ---`;
      if (analysis) {
        context += `\n[${analysis.lines || 0} lines, ${analysis.functions?.length || 0} functions, ${analysis.classes?.length || 0} classes]`;
      }
      context += `\n${truncated}`;
    }
  });

  // Add key source files with highest complexity
  const importantSourceFiles = Object.entries(codeAnalysis || {})
    .filter(([path, analysis]) => {
      const isSource = !path.toLowerCase().includes('package.json') && !path.toLowerCase().includes('readme');
      const hasComplexity = (analysis.functions?.length || 0) + (analysis.classes?.length || 0) > 2;
      return isSource && hasComplexity;
    })
    .sort(([,a], [,b]) => ((b.functions?.length || 0) + (b.classes?.length || 0)) - ((a.functions?.length || 0) + (a.classes?.length || 0)))
    .slice(0, 8) // Reduced from 15 to focus on most important
    .map(([path]) => path);

  if (importantSourceFiles.length > 0) {
    context += `\n\n==== MAIN SOURCE FILES ====`;
    
    importantSourceFiles.forEach(filePath => {
      if (fullContent && fullContent[filePath]) {
        const content = fullContent[filePath];
        const analysis = codeAnalysis[filePath];
        
        // More aggressive truncation for source files
        const truncated = content.length > 6000 ? content.substring(0, 6000) + '\n... [truncated for context]' : content;
        
        context += `\n\n--- ${filePath} ---`;
        if (analysis) {
          context += `\n[Functions: ${analysis.functions?.slice(0, 5).map(f => f.name).join(', ') || 'none'}]`;
          context += `\n[Classes: ${analysis.classes?.slice(0, 3).map(c => c.name).join(', ') || 'none'}]`;
        }
        context += `\n${truncated}`;
      }
    });
  }

  // Add comprehensive summary
  context += `\n\n==== PROJECT INSIGHTS ====`;
  
  if (summary.frameworks?.length > 0) {
    context += `\nFrameworks: ${summary.frameworks.join(', ')}`;
  }
  
  if (summary.dependencies?.length > 0) {
    context += `\nKey Dependencies: ${summary.dependencies.slice(0, 15).join(', ')}`;
  }

  // Add architecture patterns
  const architectureInsights = generateArchitectureInsights(codeAnalysis, summary);
  if (architectureInsights) {
    context += `\nArchitecture Patterns:\n${architectureInsights}`;
  }

  // Add file organization insights
  context += `\nProject Organization:`;
  context += `\n• Entry Points: ${summary.mainEntryPoints?.join(', ') || 'Not identified'}`;
  context += `\n• Config Files: ${summary.configFiles?.length || 0}`;
  context += `\n• Documentation: ${summary.documentationFiles?.length || 0}`;
  context += `\n• Test Files: ${summary.testFiles?.length || 0}`;

  // Log context size for debugging
  console.log(`📝 Context built: ${context.length} characters, ${context.split('\n').length} lines`);

  return context;
}

function buildSimplifiedProjectContext(projectIndex, owner, repo, question) {
  if (!projectIndex) return '';
  
  const { summary, fullContent, codeAnalysis } = projectIndex;
  
  // Build a much more focused context for small models
  let context = `REPO: ${owner}/${repo}
FILES: ${summary.totalFiles || 0} (${summary.totalLines?.toLocaleString() || '?'} lines)
LANGUAGES: ${summary.languages?.slice(0, 3).join(', ') || 'Unknown'}
FRAMEWORKS: ${summary.frameworks?.slice(0, 3).join(', ') || 'None'}
COMPONENTS: ${summary.totalFunctions || 0} functions, ${summary.totalClasses || 0} classes`;

  // Only include the most relevant files based on the question
  const questionLower = question.toLowerCase();
  const relevantFiles = Object.keys(fullContent || {}).filter(filePath => {
    const fileName = filePath.toLowerCase();
    
    // Always include package.json and README
    if (fileName.includes('package.json') || fileName.includes('readme')) return true;
    
    // Include files that match question keywords
    if (questionLower.includes('main') && fileName.includes('main')) return true;
    if (questionLower.includes('app') && fileName.includes('app')) return true;
    if (questionLower.includes('server') && fileName.includes('server')) return true;
    if (questionLower.includes('component') && fileName.includes('component')) return true;
    if (questionLower.includes('config') && fileName.includes('config')) return true;
    if (questionLower.includes('route') && fileName.includes('route')) return true;
    if (questionLower.includes('api') && fileName.includes('api')) return true;
    
    // Include files with high complexity
    const analysis = codeAnalysis[filePath];
    return analysis && ((analysis.functions?.length || 0) + (analysis.classes?.length || 0)) >= 3;
  }).slice(0, 4); // Maximum 4 files

  if (relevantFiles.length > 0) {
    context += '\n\nKEY FILES:';
    
    relevantFiles.forEach(filePath => {
      const content = fullContent[filePath];
      const analysis = codeAnalysis[filePath];
      
      // Much more aggressive truncation for small models
      const preview = content.length > 2000 ? content.substring(0, 2000) + '...' : content;
      
      context += `\n\n--- ${filePath} ---`;
      if (analysis && (analysis.functions?.length || analysis.classes?.length)) {
        context += `\n[${analysis.functions?.length || 0} functions, ${analysis.classes?.length || 0} classes]`;
      }
      context += `\n${preview}`;
    });
  }

  return context;
}

function generateArchitectureInsights(codeAnalysis, summary) {
  let insights = '';
  
  // Analyze project structure patterns
  const hasComponents = summary.totalComponents > 0;
  const hasClasses = summary.totalClasses > 0;
  const hasFunctions = summary.totalFunctions > 0;
  const hasTests = summary.testFiles?.length > 0;
  const hasConfig = summary.configFiles?.length > 0;
  
  if (hasComponents) {
    insights += '- Component-based architecture (likely React/Vue application)\n';
  }
  
  if (hasClasses && hasFunctions) {
    insights += '- Mixed OOP and functional programming patterns\n';
  } else if (hasClasses) {
    insights += '- Object-oriented architecture\n';
  } else if (hasFunctions) {
    insights += '- Functional programming approach\n';
  }
  
  if (hasTests) {
    insights += `- Includes testing suite (${summary.testFiles.length} test files)\n`;
  }
  
  if (hasConfig) {
    insights += `- Well-configured project (${summary.configFiles.length} config files)\n`;
  }
  
  // Analyze framework patterns
  if (summary.frameworks?.includes('React')) {
    insights += '- React-based frontend architecture\n';
  }
  if (summary.frameworks?.includes('Express.js')) {
    insights += '- Express.js backend server architecture\n';
  }
  if (summary.frameworks?.includes('Next.js')) {
    insights += '- Full-stack Next.js application\n';
  }
  
  return insights || '- Architecture analysis not available';
}

function buildProjectStructureContext(structure) {
  if (!structure) return 'Structure not available';
  
  let structureText = '';
  
  function addDirectoryTree(items, indent = '') {
    items.forEach(item => {
      structureText += `${indent}${item.type === 'dir' ? '📁' : '📄'} ${item.name}\n`;
      if (item.children && item.children.length > 0) {
        addDirectoryTree(item.children, indent + '  ');
      }
    });
  }
  
  if (structure.tree) {
    addDirectoryTree(structure.tree);
  }
  
  return structureText || 'Directory structure not available';
}

export default router;