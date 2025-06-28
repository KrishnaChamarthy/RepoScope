import pool from '../db/db.js';
import fs from 'fs';
import path from 'path';

function getLanguageFromExtension(ext) {
  switch (ext) {
    case '.js': return 'JavaScript';
    case '.jsx': return 'JavaScript (JSX)';
    case '.ts': return 'TypeScript';
    case '.tsx': return 'TypeScript (TSX)';
    case '.py': return 'Python';
    case '.java': return 'Java';
    case '.cpp': return 'C++';
    case '.c': return 'C';
    case '.cs': return 'C#';
    case '.css': return 'CSS';
    case '.html': return 'HTML';
    case '.json': return 'JSON';
    case '.md': return 'Markdown';
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
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.css',
    '.html', '.json', '.md', '.txt', '.env', '.yml', '.yaml', '.csv'
  ];
  return textExtensions.includes(path.extname(filePath).toLowerCase());
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
