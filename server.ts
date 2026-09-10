import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { router as apiRouter } from './server/routes.js';
import { UPLOAD_DIR } from './server/upload.js';
import { initializeDatabase } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize and seed database if not existing
  initializeDatabase();

  // Basic Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static serving for uploads
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Routes
  app.use('/api', apiRouter);

  // Vite middleware for development vs Production build serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SD Negeri 53 Kota Bengkulu running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
