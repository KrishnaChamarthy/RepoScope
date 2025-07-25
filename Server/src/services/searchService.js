import pool from '../db/db.js';

export const searchCode = async (query) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM parsed_files WHERE code ILIKE $1 OR function_name ILIKE $1 LIMIT 20`,
      [`%${query}%`]
    );
    return rows;
  } catch (error) {
    console.error('Database search error:', error);
    throw error;
  }
};
