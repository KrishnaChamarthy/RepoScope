import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';

export const cloneRepo = async (repoUrl) => {
  const tempPath = path.resolve('temp', Date.now().toString());
  fs.mkdirSync(tempPath, { recursive: true });
  const git = simpleGit();
  await git.clone(repoUrl, tempPath);
  return tempPath;
};

export const cleanupRepo = async (repoPath) => {
  try {
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Failed to cleanup repository:', err);
  }
};

export const parseGitHubUrl = (url) => {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/;
  const match = url.match(githubUrlRegex);
  
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
