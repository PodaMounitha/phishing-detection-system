import express from 'express';
import cors from 'cors';
import { phishingRouter } from './routes/phishing.js';
import { codeReviewRouter } from './routes/codeReview.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/phishing', phishingRouter);
app.use('/api/code-review', codeReviewRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});