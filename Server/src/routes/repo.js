import express from 'express';
import { cloneRepo } from '../services/gitService.js';
import { parseRepo } from '../services/parseService.js';

const router = express.Router();

router.post('/clone', async (req, res) => {
  const { repoUrl } = req.body;

  try {
    const path = await cloneRepo(repoUrl);
    const result = await parseRepo(path);
    res.json({ success: true, message: result });
  } catch (error) {
    console.error('Clone/Parse Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
