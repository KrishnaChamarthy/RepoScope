import pool from '../db/db.js';
import fs from 'fs';
import path from 'path';

function getLanguageFromExtension(ext) {
  switch (ext.toLowerCase()) {
    case '.js': return 'JavaScript';
    case '.jsx': return 'React (JSX)';
    case '.ts': return 'TypeScript';
    case '.tsx': return 'React (TSX)';
    case '.py': return 'Python';
    case '.java': return 'Java';
    case '.cpp': 
    case '.cc': 
    case '.cxx': return 'C++';
    case '.c': return 'C';
    case '.cs': return 'C#';
    case '.css': return 'CSS';
    case '.scss': 
    case '.sass': return 'SCSS/Sass';
    case '.html': 
    case '.htm': return 'HTML';
    case '.json': return 'JSON';
    case '.md': 
    case '.markdown': return 'Markdown';
    case '.yaml': 
    case '.yml': return 'YAML';
    case '.xml': return 'XML';
    case '.php': return 'PHP';
    case '.rb': return 'Ruby';
    case '.go': return 'Go';
    case '.rs': return 'Rust';
    case '.swift': return 'Swift';
    case '.kt': 
    case '.kts': return 'Kotlin';
    case '.vue': return 'Vue.js';
    case '.svelte': return 'Svelte';
    case '.sh': 
    case '.bash': return 'Shell Script';
    case '.ps1': return 'PowerShell';
    case '.dockerfile': return 'Dockerfile';
    case '.sql': return 'SQL';
    case '.r': return 'R';
    case '.m': return 'MATLAB/Objective-C';
    case '.pl': return 'Perl';
    case '.lua': return 'Lua';
    case '.dart': return 'Dart';
    default: return ext.replace('.', '').toUpperCase() || 'Unknown';
  }
}

function getAllFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file.startsWith('.')) return;
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

function isTextFile(filePath) {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.cc', '.cxx', '.c', '.cs', 
    '.css', '.scss', '.sass', '.html', '.htm', '.json', '.md', '.markdown', '.txt', 
    '.env', '.yml', '.yaml', '.csv', '.xml', '.php', '.rb', '.go', '.rs', '.swift', 
    '.kt', '.kts', '.vue', '.svelte', '.sh', '.bash', '.ps1', '.dockerfile', '.sql', 
    '.r', '.m', '.pl', '.lua', '.dart', '.gitignore', '.gitattributes', '.editorconfig'
  ];
  const fileName = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();
  
  // Check by extension
  if (textExtensions.includes(ext)) return true;
  
  // Check by filename patterns
  if (fileName === 'dockerfile' || fileName === 'makefile' || fileName === 'readme') return true;
  if (fileName.startsWith('.env') || fileName.endsWith('rc') || fileName.endsWith('config')) return true;
  
  return false;
}

export const parseRepo = async (repoPath) => {
  const files = getAllFiles(repoPath);
  let inserted = 0;

  for (const file of files) {
    if (!isTextFile(file)) continue; // Skip non-text files

    const ext = path.extname(file);
    const language = getLanguageFromExtension(ext);
    let code;
    try {
      code = fs.readFileSync(file, 'utf-8');
      if (code.includes('\x00')) continue; // Skip files with null bytes
    } catch {
      continue; // Skip unreadable files
    }
    const function_name = path.basename(file, ext);
    const docstring = '';
    const lines = code.split('\n').length;

    await pool.query(
      `INSERT INTO parsed_files (filename, language, function_name, code, docstring, lines)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        path.relative(repoPath, file),
        language,
        function_name,
        code,
        docstring,
        lines
      ]
    );
    inserted++;
  }

  return `Inserted ${inserted} files from ${repoPath}`;
};

export const analyzeProject = async (repoPath) => {
  const files = getAllFiles(repoPath);
  const languageStats = {};
  const fileStructure = [];
  let totalLines = 0;
  let complexityScore = 0;
  
  // Track project type indicators
  const projectIndicators = {
    hasPackageJson: false,
    hasRequirementsTxt: false,
    hasDockerfile: false,
    hasGitignore: false,
    frameworks: new Set(),
    buildTools: new Set()
  };
  
  for (const file of files) {
    const fileName = path.basename(file).toLowerCase();
    const relativePath = path.relative(repoPath, file);
    
    // Check for project indicators
    if (fileName === 'package.json') projectIndicators.hasPackageJson = true;
    if (fileName === 'requirements.txt') projectIndicators.hasRequirementsTxt = true;
    if (fileName === 'dockerfile') projectIndicators.hasDockerfile = true;
    if (fileName === '.gitignore') projectIndicators.hasGitignore = true;
    
    // Detect frameworks and tools from file names
    if (fileName.includes('vite.config')) projectIndicators.buildTools.add('Vite');
    if (fileName.includes('webpack.config')) projectIndicators.buildTools.add('Webpack');
    if (fileName.includes('tailwind.config')) projectIndicators.frameworks.add('Tailwind CSS');
    if (fileName.includes('next.config')) projectIndicators.frameworks.add('Next.js');
    if (fileName.includes('nuxt.config')) projectIndicators.frameworks.add('Nuxt.js');
    if (fileName.includes('vue.config')) projectIndicators.frameworks.add('Vue.js');
    if (fileName.includes('svelte.config')) projectIndicators.frameworks.add('Svelte');
    
    if (!isTextFile(file)) continue;
    
    const ext = path.extname(file);
    const language = getLanguageFromExtension(ext);
    
    try {
      const code = fs.readFileSync(file, 'utf-8');
      if (code.includes('\x00')) continue;
      
      const lines = code.split('\n').length;
      totalLines += lines;
      
      // Detect frameworks from code content
      if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
        if (code.includes('from "react"') || code.includes("from 'react'")) projectIndicators.frameworks.add('React');
        if (code.includes('from "vue"') || code.includes("from 'vue'")) projectIndicators.frameworks.add('Vue.js');
        if (code.includes('from "express"') || code.includes("from 'express'")) projectIndicators.frameworks.add('Express.js');
        if (code.includes('from "next"') || code.includes("from 'next'")) projectIndicators.frameworks.add('Next.js');
        if (code.includes('@angular') || code.includes('from "@angular"')) projectIndicators.frameworks.add('Angular');
      }
      
      // Update language statistics
      if (!languageStats[language]) {
        languageStats[language] = { files: 0, lines: 0 };
      }
      languageStats[language].files++;
      languageStats[language].lines += lines;
      
      // Calculate complexity based on file content
      const complexity = calculateFileComplexity(code, language);
      complexityScore += complexity;
      
      // Add to file structure
      fileStructure.push({
        path: relativePath,
        language,
        lines,
        complexity
      });
    } catch {
      continue;
    }
  }
  
  // Determine overall complexity
  const avgComplexity = complexityScore / Math.max(files.length, 1);
  let overallComplexity = 'Low';
  if (avgComplexity > 20) overallComplexity = 'High';
  else if (avgComplexity > 10) overallComplexity = 'Medium';
  
  // Generate more accurate insights
  const topLanguages = Object.entries(languageStats)
    .sort(([,a], [,b]) => b.lines - a.lines)
    .slice(0, 3)
    .map(([lang]) => lang);
  
  const frameworks = Array.from(projectIndicators.frameworks);
  const buildTools = Array.from(projectIndicators.buildTools);
  
  let projectType = 'General';
  if (projectIndicators.hasPackageJson && (topLanguages.includes('JavaScript') || topLanguages.includes('TypeScript'))) {
    projectType = 'JavaScript/Node.js';
  } else if (projectIndicators.hasRequirementsTxt && topLanguages.includes('Python')) {
    projectType = 'Python';
  } else if (topLanguages.includes('React (JSX)') || topLanguages.includes('React (TSX)') || frameworks.includes('React')) {
    projectType = 'React Application';
  } else if (frameworks.includes('Vue.js')) {
    projectType = 'Vue.js Application';
  } else if (frameworks.includes('Next.js')) {
    projectType = 'Next.js Application';
  } else if (frameworks.includes('Express.js')) {
    projectType = 'Express.js Server';
  }
  
  // Generate more accurate insights using LLM
  let insights = `${projectType} project with ${files.length} files and ${totalLines.toLocaleString()} lines of code.`;
  
  if (topLanguages.length > 0) {
    insights += ` Primary languages: ${topLanguages.join(', ')}.`;
  }
  
  if (frameworks.length > 0) {
    insights += ` Uses ${frameworks.join(', ')}.`;
  }
  
  if (buildTools.length > 0) {
    insights += ` Built with ${buildTools.join(', ')}.`;
  }
  
  if (projectIndicators.hasDockerfile) {
    insights += ' Containerized with Docker.';
  }
  
  // Try to generate AI insights asynchronously (don't block the response)
  const repoAnalysisData = {
    name: 'Repository',
    description: 'Code repository analysis',
    language: topLanguages[0],
    languageStats,
    projectType,
    frameworks,
    buildTools,
    fileStructure: fileStructure.slice(0, 20), // Limit for performance
    totalFiles: files.length,
    totalLines
  };
  
  // Generate AI insights in background
  generateAIInsights(repoAnalysisData).then(aiInsights => {
    if (aiInsights) {
      insights = aiInsights;
    }
  }).catch(err => {
    console.warn('Failed to generate AI insights:', err.message);
  });
  
  return {
    complexity: overallComplexity,
    insights,
    fileStructure,
    languageStats,
    totalFiles: files.length,
    totalLines,
    projectType,
    frameworks,
    buildTools
  };
};

async function generateAIInsights(repoData) {
  try {
    const { analyzeRepository } = await import('./llmService.js');
    return await analyzeRepository(repoData);
  } catch (error) {
    console.warn('AI insights generation failed:', error.message);
    return null;
  }
}

function calculateFileComplexity(code, language) {
  let complexity = 0;
  const lines = code.split('\n');
  
  // Basic metrics
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  const commentLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || 
           trimmed.startsWith('#') || trimmed.startsWith('<!--');
  }).length;
  
  // Calculate comment ratio (higher ratio = lower complexity)
  const commentRatio = commentLines / Math.max(nonEmptyLines, 1);
  
  // Language-specific complexity calculation
  switch (language) {
    case 'JavaScript':
    case 'React (JSX)':
    case 'TypeScript':
    case 'React (TSX)':
      complexity += countPattern(code, /\b(if|else|switch|case|while|for|forEach|map|filter|reduce)\b/g) * 1;
      complexity += countPattern(code, /\b(function|=&gt;|\bconst\s+\w+\s*=\s*\(|\blet\s+\w+\s*=\s*\()\b/g) * 2;
      complexity += countPattern(code, /\b(import|require|export)\b/g) * 0.5;
      complexity += countPattern(code, /\b(Promise|async|await|callback|\.then|\.catch)\b/g) * 2;
      complexity += countPattern(code, /\b(class|extends|implements)\b/g) * 3;
      complexity += countPattern(code, /\b(try|catch|throw|finally)\b/g) * 2;
      break;
      
    case 'Python':
      complexity += countPattern(code, /\b(if|elif|else|while|for|with)\b/g) * 1;
      complexity += countPattern(code, /\bdef\s+\w+/g) * 2;
      complexity += countPattern(code, /\b(import|from)\b/g) * 0.5;
      complexity += countPattern(code, /\b(class|lambda|decorator|@\w+)\b/g) * 2;
      complexity += countPattern(code, /\b(try|except|raise|finally)\b/g) * 2;
      break;
      
    case 'Java':
    case 'C#':
      complexity += countPattern(code, /\b(if|else|switch|case|while|for|foreach)\b/g) * 1;
      complexity += countPattern(code, /(public|private|protected)\s+(static\s+)?\w+\s+\w+\s*\(/g) * 2;
      complexity += countPattern(code, /\b(import|using)\b/g) * 0.5;
      complexity += countPattern(code, /\b(class|interface|extends|implements)\b/g) * 3;
      complexity += countPattern(code, /\b(try|catch|throw|finally)\b/g) * 2;
      break;
      
    case 'CSS':
    case 'SCSS/Sass':
      complexity += countPattern(code, /[.#]\w+/g) * 0.5; // Selectors
      complexity += countPattern(code, /@\w+/g) * 1; // At-rules
      complexity += countPattern(code, /:\w+/g) * 0.3; // Pseudo-selectors
      break;
      
    case 'HTML':
      complexity += countPattern(code, /&lt;\w+/g) * 0.3; // Tags
      complexity += countPattern(code, /&lt;script|&lt;style/g) * 2; // Embedded scripts/styles
      break;
      
    case 'JSON':
    case 'YAML':
    case 'Markdown':
      complexity = Math.min(nonEmptyLines * 0.1, 5); // Very low complexity
      break;
      
    default:
      // Generic complexity for unknown languages
      complexity += countPattern(code, /\b(if|else|while|for)\b/g) * 1;
      complexity += countPattern(code, /\b(function|def|class)\b/g) * 2;
      break;
  }
  
  // Adjust for comment ratio (well-commented code is less complex to understand)
  complexity *= (1 - Math.min(commentRatio * 0.3, 0.5));
  
  // Normalize by file size (longer files aren't necessarily more complex)
  const sizeNormalization = Math.min(1 + (nonEmptyLines / 100) * 0.1, 2);
  complexity *= sizeNormalization;
  
  return Math.min(Math.max(complexity, 1), 50); // Ensure between 1 and 50
}

function countPattern(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}
