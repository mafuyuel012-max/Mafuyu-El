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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Support both /api prefixed routes and stripped routes from Vercel rewrites
app.use('/api', apiRouter);
app.use(apiRouter);

// Global error handler so no unhandled exception returns blank 500
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err?.message || 'Terjadi kesalahan pada server.' });
});

export default app;
