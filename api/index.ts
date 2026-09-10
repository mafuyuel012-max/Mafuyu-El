import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { router as apiRouter } from '../server/routes.js';
import { initializeDatabase } from '../server/db.js';

const app = express();

// Initialize in-memory or persisted database
initializeDatabase();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', apiRouter);

export default app;
