/**
 * Validates if a given URL is a valid GitHub repository URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid GitHub URL
 */
export const isGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (trimmed.length < 20) return false; // Minimum viable GitHub URL length
  
  const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\.git)?(\?.*)?(\#.*)?$/;
  return githubUrlRegex.test(trimmed);
};

/**
 * Extracts owner and repository name from GitHub URL
 * @param {string} url - The GitHub URL
 * @returns {object|null} - Object with owner and repo properties, or null if invalid
 */
export const parseGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const githubUrlRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(\.git)?(\?.*)?(\#.*)?$/;
  const match = url.trim().match(githubUrlRegex);
  
  if (!match) {
    return null;
  }
  
  const [, owner, repoName] = match;
  return {
    owner,
    repo: repoName.replace('.git', ''),
    fullName: `${owner}/${repoName.replace('.git', '')}`
  };
};

/**
 * Formats repository data for consistent display
 * @param {object} repoData - Raw repository data
 * @returns {object} - Formatted repository object
 */
export const formatRepositoryData = (repoData) => {
  return {
    id: repoData.id,
    name: repoData.name || repoData.full_name,
    description: repoData.description || 'No description available',
    stars: repoData.stars || repoData.stargazers_count || 0,
    forks: repoData.forks || repoData.forks_count || 0,
    issues: repoData.issues || repoData.open_issues_count || 0,
    language: repoData.language || 'Unknown',
    lastUpdated: repoData.lastUpdated || new Date(repoData.updated_at).toLocaleString(),
    complexity: repoData.complexity || 'Unknown',
    aiInsights: repoData.aiInsights || 'No insights available',
    isUserRepo: repoData.isUserRepo || false,
    clonePath: repoData.clonePath,
    fileStructure: repoData.fileStructure,
    languageStats: repoData.languageStats
  };
};

/**
 * Validates and normalizes GitHub URL input
 * @param {string} input - User input string
 * @returns {string|null} - Normalized GitHub URL or null if invalid
 */
export const normalizeGitHubUrl = (input) => {
  const trimmed = input?.trim();
  if (!trimmed) return null;
  
  // If it's already a valid GitHub URL, return as is
  if (isGitHubUrl(trimmed)) {
    return trimmed;
  }
  
  // Try to construct GitHub URL from partial input
  // Examples: "owner/repo", "github.com/owner/repo"
  const shortRegex = /^([^\/]+)\/([^\/]+)$/;
  const partialRegex = /^github\.com\/([^\/]+)\/([^\/]+)$/;
  
  let match = trimmed.match(shortRegex);
  if (match) {
    const [, owner, repo] = match;
    return `https://github.com/${owner}/${repo}`;
  }
  
  match = trimmed.match(partialRegex);
  if (match) {
    const [, owner, repo] = match;
    return `https://github.com/${owner}/${repo}`;
  }
  
  return null;
};
