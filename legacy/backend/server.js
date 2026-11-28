import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestRouter from './routes/ingest.js';
import chatRouter from './routes/chat.js';
import documentsRouter from './routes/documents.js';
import historyRouter from './routes/history.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GyanAI API' });
});

app.use('/api/ingest', ingestRouter);
app.use('/api/chat', chatRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/history', historyRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`GyanAI API running on http://localhost:${PORT}`);
});
