import pool from '../db/db.js';

export const parseRepo = async (repoPath) => {
  // TODO: Replace with Tree-sitter or AST logic
  const dummy = {
    filename: 'example.py',
    language: 'Python',
    function_name: 'fibonacci',
    code: 'def fibonacci(n): return n',
    docstring: 'Calculates Fibonacci number.',
    lines: 3
  };

  await pool.query(
    `INSERT INTO parsed_files (filename, language, function_name, code, docstring, lines)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      dummy.filename,
      dummy.language,
      dummy.function_name,
      dummy.code,
      dummy.docstring,
      dummy.lines
    ]
  );

  return `Inserted dummy parsed result for ${dummy.filename}`;
};
