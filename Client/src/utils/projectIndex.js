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

export const buildProjectIndex = async (files, api, owner, repo) => {
  const index = {
    structure: analyzeProjectStructure(files),
    codeAnalysis: {},
    summary: {
      totalFiles: 0,
      totalFunctions: 0,
      totalClasses: 0,
      totalComponents: 0,
      languages: new Set(),
      mainEntryPoints: [],
      configFiles: []
    }
  };

  // Analyze important files
  const importantFiles = files.filter(file => {
    if (file.type === 'dir') return false;
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();
    
    // Include main files, config files, and code files
    return (
      name.includes('index') ||
      name.includes('main') ||
      name.includes('app') ||
      name.includes('config') ||
      name.includes('package.json') ||
      name.includes('readme') ||
      ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c'].includes(ext)
    );
  });

  // Limit to avoid overwhelming the system
  const filesToAnalyze = importantFiles.slice(0, 20);

  for (const file of filesToAnalyze) {
    try {
      const res = await api.get(`/github/repo/${owner}/${repo}/file`, {
        params: { path: file.path || file.name }
      });
      
      const content = res.data.content || '';
      const analysis = analyzeCodeContent(content, file.path || file.name);
      
      index.codeAnalysis[file.path || file.name] = {
        ...analysis,
        size: content.length,
        lines: content.split('\n').length
      };

      // Update summary
      index.summary.totalFiles++;
      index.summary.totalFunctions += analysis.functions.length;
      index.summary.totalClasses += analysis.classes.length;
      index.summary.totalComponents += analysis.components.length;
      
      const ext = (file.path || file.name).split('.').pop()?.toLowerCase();
      if (ext) index.summary.languages.add(ext);

      // Identify entry points
      const fileName = (file.path || file.name).toLowerCase();
      if (fileName.includes('index') || fileName.includes('main') || fileName.includes('app')) {
        index.summary.mainEntryPoints.push(file.path || file.name);
      }

      // Identify config files
      if (fileName.includes('config') || fileName.includes('package.json') || fileName.includes('webpack') || fileName.includes('babel')) {
        index.summary.configFiles.push(file.path || file.name);
      }
    } catch (error) {
      console.warn(`Failed to analyze file ${file.path || file.name}:`, error);
    }
  }

  index.summary.languages = Array.from(index.summary.languages);
  return index;
};