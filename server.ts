import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const PHP_BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cheerplex.com/soka_king').replace(/\/$/, '');

  app.use(express.json());

  // CORS headers for frontend requests
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  console.log(`[SOKA King Frontend Server] Connected to PHP Backend at: ${PHP_BACKEND_URL}`);

  // Proxy /api requests to PHP Backend Server
  app.all('/api/*', async (req, res) => {
    const targetUrl = `${PHP_BACKEND_URL}${req.originalUrl}`;
    console.log(`[Proxy -> PHP Backend] ${req.method} ${targetUrl}`);
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization as string;
      }
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const phpRes = await fetch(targetUrl, fetchOptions);
      const data = await phpRes.text();
      
      res.status(phpRes.status);
      res.setHeader('Content-Type', phpRes.headers.get('content-type') || 'application/json');
      return res.send(data);
    } catch (error: any) {
      console.error(`[Proxy Error] Failed to connect to PHP Backend at ${targetUrl}:`, error.message);
      return res.status(502).json({
        error: 'PHP Backend Service Unavailable',
        message: error.message,
        targetUrl,
        phpBackendGuide: 'Ensure php-backend files are uploaded to cheerplex.com/soka_king'
      });
    }
  });

  // Serve Frontend with Vite in dev, or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('.', 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve('.', 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

