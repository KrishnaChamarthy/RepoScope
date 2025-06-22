import express from 'express';
import { explainCode } from '../services/llmService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { code } = req.body;

  try {
    const explanation = await explainCode(code);
    res.json({ success: true, explanation });
  } catch (error) {
    console.error('LLM Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
