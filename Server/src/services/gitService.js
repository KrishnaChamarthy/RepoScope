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
