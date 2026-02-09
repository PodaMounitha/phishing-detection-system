import express from 'express';
import { analyzeEmail } from '../services/phishingService.js';

export const phishingRouter = express.Router();

phishingRouter.post('/analyze', async (req, res) => {
  try {
    const { emailContent } = req.body;
    const result = await analyzeEmail(emailContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});