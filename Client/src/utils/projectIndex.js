const PROJECT_INDEX_KEY = 'project_indices';

export const saveProjectIndex = (owner, repo, index) => {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_INDEX_KEY) || '{}');
    const repoKey = `${owner}/${repo}`;
    stored[repoKey] = {
      index,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save project index:', error);
  }
};

export const loadProjectIndex = (owner, repo) => {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_INDEX_KEY) || '{}');
    const repoKey = `${owner}/${repo}`;
    return stored[repoKey]?.index || null;
  } catch (error) {
    console.error('Failed to load project index:', error);
    return null;
  }
};

export const buildProjectIndex = async (files, api, owner, repo, onProgress = null) => {
  const index = {
    structure: analyzeProjectStructure(files),
    codeAnalysis: {},
    fullContent: {}, // Store actual file content for AI context
    fileMetadata: {}, // Store additional file metadata
    summary: {
      totalFiles: 0,
      totalFunctions: 0,
      totalClasses: 0,
      totalComponents: 0,
      totalLines: 0,
      languages: new Set(),
      mainEntryPoints: [],
      configFiles: [],
      documentationFiles: [],
      testFiles: [],
      dependencies: new Set(),
      frameworks: new Set()
    }
  };

  // Analyze ALL relevant files for comprehensive context
  const relevantFiles = files.filter(file => {
    if (file.type === 'dir') return false;
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();
    
    // Skip common binary/large files but include all text-based files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'ico', 'pdf', 'zip', 'tar', 'gz'].includes(ext)) {
      return false;
    }
    
    // Include comprehensive file types for AI analysis
    return (
      // Configuration files
      ['json', 'yml', 'yaml', 'toml', 'ini', 'config', 'env'].includes(ext) ||
      name.includes('dockerfile') || name.includes('makefile') ||
      name.includes('requirements.txt') || name.includes('package.json') ||
      name.includes('cargo.toml') || name.includes('pom.xml') ||
      name.includes('build.gradle') || name.includes('composer.json') ||
      // Documentation
      ['md', 'txt', 'rst', 'adoc'].includes(ext) ||
      // Source code files
      ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'scala', 'sql', 'r', 'swift'].includes(ext) ||
      // Web files
      ['html', 'htm', 'vue', 'svelte', 'css', 'scss', 'sass', 'less'].includes(ext) ||
      // Script files
      ['sh', 'bat', 'ps1', 'fish', 'zsh'].includes(ext) ||
      // Data files
      ['xml', 'csv', 'tsv', 'graphql', 'proto'].includes(ext) ||
      // Infrastructure
      ['tf', 'hcl', 'nomad', 'consul'].includes(ext)
    );
  });

  // Sort files by importance for better analysis
  const prioritizedFiles = [...relevantFiles].sort((a, b) => {
    const aName = (a.path || a.name).toLowerCase();
    const bName = (b.path || b.name).toLowerCase();
    
    // Highest priority: package.json, main files, README
    const veryHighPriority = ['package.json', 'readme', 'main.', 'index.', 'app.', 'server.'];
    const aVeryHigh = veryHighPriority.some(p => aName.includes(p));
    const bVeryHigh = veryHighPriority.some(p => bName.includes(p));
    
    if (aVeryHigh && !bVeryHigh) return -1;
    if (!aVeryHigh && bVeryHigh) return 1;
    
    // High priority: config files, documentation
    const highPriority = ['config', 'dockerfile', '.env', 'changelog', 'license'];
    const aHigh = highPriority.some(p => aName.includes(p));
    const bHigh = highPriority.some(p => bName.includes(p));
    
    if (aHigh && !bHigh) return -1;
    if (!aHigh && bHigh) return 1;
    
    return 0;
  });

  // Analyze up to 100 files for very comprehensive context (increased from 50)
  const filesToAnalyze = prioritizedFiles.slice(0, 100);
  const totalFiles = filesToAnalyze.length;

  for (let i = 0; i < filesToAnalyze.length; i++) {
    const file = filesToAnalyze[i];
    
    // Report progress if callback provided
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalFiles,
        fileName: file.name,
        phase: 'Analyzing files'
      });
    }
    
    try {
      const res = await api.get(`/github/repo/${owner}/${repo}/file`, {
        params: { path: file.path || file.name }
      });
      
      const content = res.data.content || '';
      const filePath = file.path || file.name;
      const fileName = filePath.toLowerCase();
      const ext = filePath.split('.').pop()?.toLowerCase();
      
      // Enhanced file analysis
      const analysis = analyzeCodeContent(content, filePath);
      
      // Store both analysis and full content for AI context
      index.codeAnalysis[filePath] = {
        ...analysis,
        size: content.length,
        lines: content.split('\n').length,
        extension: ext
      };
      
      // Store content for AI (truncate very large files to avoid context overflow)
      const truncatedContent = content.length > 15000 
        ? content.substring(0, 15000) + '\n\n... (file truncated for context, showing first 15000 characters)'
        : content;
      index.fullContent[filePath] = truncatedContent;

      // Store additional metadata
      index.fileMetadata[filePath] = {
        size: content.length,
        lines: content.split('\n').length,
        extension: ext,
        lastModified: new Date().toISOString() // GitHub API doesn't provide this easily
      };

      // Enhanced dependency extraction
      extractDependencies(content, fileName, index.summary.dependencies, index.summary.frameworks);

      // Update comprehensive summary
      index.summary.totalFiles++;
      index.summary.totalLines += content.split('\n').length;
      index.summary.totalFunctions += analysis.functions?.length || 0;
      index.summary.totalClasses += analysis.classes?.length || 0;
      index.summary.totalComponents += analysis.components?.length || 0;
      
      if (ext) index.summary.languages.add(ext);

      // Enhanced file categorization with more detailed detection
      categorizeFile(filePath, fileName, content, index.summary);
      
    } catch (error) {
      console.warn(`Failed to analyze file ${file.path || file.name}:`, error);
    }
  }

  // Convert Sets to Arrays for JSON serialization
  index.summary.languages = Array.from(index.summary.languages);
  index.summary.dependencies = Array.from(index.summary.dependencies);
  index.summary.frameworks = Array.from(index.summary.frameworks);
  return index;
};

// Enhanced dependency extraction
function extractDependencies(content, fileName, dependencies, frameworks) {
  // Package.json dependencies
  if (fileName.includes('package.json')) {
    try {
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      Object.keys(deps).forEach(dep => {
        dependencies.add(dep);
        
        // Detect frameworks
        if (dep.includes('react')) frameworks.add('React');
        if (dep.includes('vue')) frameworks.add('Vue.js');
        if (dep.includes('angular')) frameworks.add('Angular');
        if (dep.includes('express')) frameworks.add('Express.js');
        if (dep.includes('next')) frameworks.add('Next.js');
        if (dep.includes('nuxt')) frameworks.add('Nuxt.js');
        if (dep.includes('svelte')) frameworks.add('Svelte');
        if (dep.includes('tailwind')) frameworks.add('Tailwind CSS');
        if (dep.includes('bootstrap')) frameworks.add('Bootstrap');
        if (dep.includes('typescript')) frameworks.add('TypeScript');
      });
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }
  
  // Python requirements.txt
  if (fileName.includes('requirements.txt') || fileName.includes('pyproject.toml')) {
    const lines = content.split('\n');
    lines.forEach(line => {
      const dep = line.trim().split(/[>=<]/)[0];
      if (dep && !dep.startsWith('#')) {
        dependencies.add(dep);
        
        // Detect Python frameworks
        if (dep.includes('django')) frameworks.add('Django');
        if (dep.includes('flask')) frameworks.add('Flask');
        if (dep.includes('fastapi')) frameworks.add('FastAPI');
        if (dep.includes('pandas')) frameworks.add('Pandas');
        if (dep.includes('numpy')) frameworks.add('NumPy');
        if (dep.includes('tensorflow')) frameworks.add('TensorFlow');
        if (dep.includes('pytorch')) frameworks.add('PyTorch');
      }
    });
  }
  
  // Import statements
  const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
  importMatches.forEach(match => {
    const dep = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    if (dep && !dep.startsWith('.') && !dep.startsWith('/')) {
      dependencies.add(dep.split('/')[0]);
    }
  });
  
  // Require statements
  const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
  requireMatches.forEach(match => {
    const dep = match.match(/require\(['"]([^'"]+)['"]\)/)?.[1];
    if (dep && !dep.startsWith('.') && !dep.startsWith('/')) {
      dependencies.add(dep.split('/')[0]);
    }
  });
}

// Enhanced file categorization
function categorizeFile(filePath, fileName, content, summary) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  // Entry points
  if (fileName.includes('index') || fileName.includes('main') || fileName.includes('app') || 
      fileName.includes('server') || fileName.includes('start') || fileName.includes('entry')) {
    summary.mainEntryPoints.push(filePath);
  }

  // Configuration files
  if (fileName.includes('config') || fileName.includes('package.json') || 
      fileName.includes('webpack') || fileName.includes('babel') || 
      fileName.includes('dockerfile') || fileName.includes('docker-compose') ||
      fileName.includes('.env') || fileName.includes('makefile') ||
      ['json', 'yml', 'yaml', 'toml', 'ini', 'config'].includes(ext)) {
    summary.configFiles.push(filePath);
  }
  
  // Documentation files
  if (['md', 'txt', 'rst', 'adoc'].includes(ext) || fileName.includes('readme') || 
      fileName.includes('changelog') || fileName.includes('license') || 
      fileName.includes('contributing') || fileName.includes('authors')) {
    summary.documentationFiles.push(filePath);
  }
  
  // Test files
  if (fileName.includes('test') || fileName.includes('spec') || 
      fileName.includes('__test__') || fileName.includes('__spec__') ||
      fileName.includes('.test.') || fileName.includes('.spec.') ||
      filePath.includes('/test/') || filePath.includes('/tests/') ||
      filePath.includes('/__tests__/')) {
    summary.testFiles.push(filePath);
  }
  
  // Detect frameworks from file content
  if (content.includes('import React') || content.includes('from "react"')) {
    summary.frameworks.add('React');
  }
  if (content.includes('import Vue') || content.includes('from "vue"')) {
    summary.frameworks.add('Vue.js');
  }
  if (content.includes('@angular/') || content.includes('import { Component }')) {
    summary.frameworks.add('Angular');
  }
  if (content.includes('from django') || content.includes('import django')) {
    summary.frameworks.add('Django');
  }
  if (content.includes('from flask') || content.includes('import flask')) {
    summary.frameworks.add('Flask');
  }
}