import express from 'express';
import { searchCode } from '../services/searchService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  try {
    const results = await searchCode(q);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
