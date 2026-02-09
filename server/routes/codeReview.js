import express from 'express';
import { analyzeCode } from '../services/codeReviewService.js';

export const codeReviewRouter = express.Router();

codeReviewRouter.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await analyzeCode(code, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});