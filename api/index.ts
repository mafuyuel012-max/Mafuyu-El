import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { router as apiRouter } from '../server/routes.js';
import { initializeDatabase } from '../server/db.js';

const app = express();

// Initialize in-memory or persisted database
try {
  initializeDatabase();
} catch (err) {
  console.warn('initializeDatabase error:', err);
}

// Enable CORS and JSON parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

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
