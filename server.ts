import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { generateSitemapXml, getAllSitemapRoutes, BASE_URL } from './src/utils/sitemapGenerator.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const PHP_BACKEND_URL = 'https://cheerplex.co.ke/soka_king';

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

  // Sitemap & Robots.txt Routes
  app.get(['/sitemap.xml', '/sitemap', '/api/sitemap.xml'], (_req, res) => {
    try {
      const xml = generateSitemapXml();
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(xml);
    } catch (err: any) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
    }
  });

  app.get('/sitemap.json', (_req, res) => {
    try {
      const routes = getAllSitemapRoutes();
      return res.json({
        baseUrl: BASE_URL,
        count: routes.length,
        routes: routes.map(r => r === '/' ? BASE_URL : `${BASE_URL}${r}`)
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(`User-agent: *
Allow: /

Sitemap: https://sokaking.com/sitemap.xml
`);
  });

  app.get('/llms.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.status(200).send(`# Soka King - Football Predictions & Betting Tips

> Soka King is a premier sports analytics platform delivering daily football predictions, jackpot analysis, over/under tips, BTTS recommendations, and VIP betting tips for sports fans in Kenya and internationally.

## Key Prediction Categories & Services

- [Football Predictions Today](https://sokaking.com/football-predictions-today): Free daily football predictions, match tips, and 1X2 odds.
- [Over 1.5 Goals Tips](https://sokaking.com/football-predictions-over-1-5-goals): Highly reliable over 1.5 goals market analysis.
- [Over 2.5 Goals Tips](https://sokaking.com/football-predictions-over-2-5-goals): High-yield over 2.5 goals match selections.
- [Both Teams To Score (BTTS / GG)](https://sokaking.com/football-predictions-btts-gg): Both teams to score tips and analysis.
- [Double Chance Predictions](https://sokaking.com/football-predictions-double-chance): 1X, X2, and 12 double chance safety predictions.
- [1X2 Home Win Tips](https://sokaking.com/football-predictions-1x2-home-win): Solitary home win predictions backed by form data.
- [Jackpot Tips & Analysis](https://sokaking.com/jackpot-tips): Comprehensive predictions for SportPesa Mega Jackpot, Betika Midweek, Mozzart, and SportyBet jackpots.
- [VIP Packages](https://sokaking.com/vip-packages): Multi-day exclusive VIP tips sent directly via instant MPesa unlock and WhatsApp.
- [About Us](https://sokaking.com/about-us): Learn about Soka King analytics model and prediction algorithms.
- [Contact Us](https://sokaking.com/contact-us): Contact customer service and technical support.
`);
  });

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
        phpBackendGuide: 'Ensure php-backend files are uploaded to cheerplex.co.ke/soka_king'
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

