import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { phishingRouter } from './routes/phishing.js';
import { codeReviewRouter } from './routes/codeReview.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1>PhishGuard API Server</h1>
      <p>The API is running successfully.</p>
      <p>To view the website, please open <strong><a href="http://localhost:5173">http://localhost:5173</a></strong></p>
      <p style="color: #666;">(Make sure you have run <code>npm run dev</code> in a separate terminal)</p>
    </div>
  `);
});

app.use('/api/phishing', phishingRouter);
app.use('/api/code-review', codeReviewRouter);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;