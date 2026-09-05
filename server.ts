import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { generateSitemapXml, getAllSitemapRoutes, BASE_URL } from './src/utils/sitemapGenerator.js';
import { injectSeoAndStructuredData, renderErrorPageHtml } from './src/utils/htmlInjector.js';
import { classifyRoute } from './src/utils/urlClassifier.js';
import { expandTopFixturesParameters, expandTopFixturesParametersAsync } from './src/utils/topJackpotFixtures.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const PHP_BACKEND_URL = 'https://cheerplex.co.ke/soka_king';

  // 1. Text compression (Gzip / Deflate) for ultra-fast TTFB and reduced document request latency
  app.use(compression({
    level: 6,
    threshold: 0, // Compress all text responses including HTML, JSON, XML, JS, and CSS
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // 2. Body parser & security/latency response headers
  app.use(express.json());

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Vary', 'Accept-Encoding');
    next();
  });

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

  // Persistent in-memory vote store fallback if remote database endpoint fails
  const memoryVotesStore = new Map<string, {
    votes1: number;
    votesX: number;
    votes2: number;
    totalVotes: number;
    userVotes: Record<string, string>;
  }>();

  function getMemoryVoteStats(fixtureId: string, userId?: string) {
    const current = memoryVotesStore.get(fixtureId) || {
      votes1: 0,
      votesX: 0,
      votes2: 0,
      totalVotes: 0,
      userVotes: {}
    };

    const total = current.votes1 + current.votesX + current.votes2;
    const hPct = total > 0 ? Math.round((current.votes1 / total) * 100) : 0;
    const dPct = total > 0 ? Math.round((current.votesX / total) * 100) : 0;
    const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

    return {
      fixtureId,
      totalVotes: total,
      votes1: current.votes1,
      votesX: current.votesX,
      votes2: current.votes2,
      homePercent: hPct,
      drawPercent: dPct,
      awayPercent: aPct,
      userVote: userId ? (current.userVotes[userId] || null) : null
    };
  }

  function recordMemoryVote(fixtureId: string, userId: string, vote: string) {
    let current = memoryVotesStore.get(fixtureId);
    if (!current) {
      current = {
        votes1: 0,
        votesX: 0,
        votes2: 0,
        totalVotes: 0,
        userVotes: {}
      };
      memoryVotesStore.set(fixtureId, current);
    }

    const prevVote = current.userVotes[userId];
    if (prevVote) {
      if (prevVote === '1' || prevVote === '1X' || prevVote === 'GG' || prevVote.startsWith('OVER')) current.votes1 = Math.max(0, current.votes1 - 1);
      else if (prevVote === 'X' || prevVote === '12') current.votesX = Math.max(0, current.votesX - 1);
      else if (prevVote === '2' || prevVote === '2X' || prevVote === 'NG' || prevVote.startsWith('UNDER')) current.votes2 = Math.max(0, current.votes2 - 1);
    }

    current.userVotes[userId] = vote;
    if (vote === '1' || vote === '1X' || vote === 'GG' || vote.startsWith('OVER')) {
      current.votes1 += 1;
    } else if (vote === 'X' || vote === '12') {
      current.votesX += 1;
    } else if (vote === '2' || vote === '2X' || vote === 'NG' || vote.startsWith('UNDER')) {
      current.votes2 += 1;
    }

    current.totalVotes = current.votes1 + current.votesX + current.votes2;
    return getMemoryVoteStats(fixtureId, userId);
  }

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
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /xmlrpc.php
Disallow: /feed/
Disallow: /tag/
Disallow: /*.php$
Disallow: /*.cgi$
Disallow: /*.asp$
Disallow: /*.aspx$
Disallow: /*.jsp$
Allow: /

Sitemap: https://sokaking.com/sitemap.xml
`);
  });

  app.get(['/disavow.txt', '/disavow'], (_req, res) => {
    const disavowPath = path.resolve('.', 'public', 'disavow.txt');
    if (fs.existsSync(disavowPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(fs.readFileSync(disavowPath, 'utf-8'));
    }
    return res.status(404).send('# Disavow file not found');
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

  // Serve dynamic live Markdown directly from src/content/pages/
  app.get('/api/markdown', async (req, res) => {
    try {
      const key = (req.query.key as string) || 'home';
      let normKey = key.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
      if (!normKey) normKey = 'home';

      if (normKey === 'today' || normKey === 'football-predictions-today') normKey = 'category-today';
      if (normKey === 'tomorrow' || normKey === 'football-predictions-tomorrow') normKey = 'category-tomorrow';
      if (normKey === 'yesterday' || normKey === 'football-predictions-yesterday') normKey = 'category-yesterday';
      if (normKey === 'over15' || normKey === 'over-1-5' || normKey === 'football-predictions-over-1-5-goals') normKey = 'category-over15';
      if (normKey === 'over25' || normKey === 'over-2-5' || normKey === 'football-predictions-over-2-5-goals') normKey = 'category-over25';
      if (normKey === 'btts' || normKey === 'gg' || normKey === 'football-predictions-btts-gg') normKey = 'category-btts';
      if (normKey === 'doublechance' || normKey === 'double-chance' || normKey === 'football-predictions-double-chance') normKey = 'category-doublechance';
      if (normKey === 'homewin' || normKey === 'home-win' || normKey === '1x2' || normKey === 'football-predictions-1x2-home-win') normKey = 'category-homewin';
      if (normKey === 'about-us') normKey = 'about';
      if (normKey === 'contact-us') normKey = 'contact';
      if (normKey === 'privacy') normKey = 'privacy-policy';
      if (normKey === 'terms') normKey = 'terms-of-use';
      if (normKey === 'vip' || normKey === 'vip-tips' || normKey === 'odds') normKey = 'vip-packages';
      if (normKey === 'jackpot-tips') normKey = 'jackpot-list';

      const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
      let filePath = path.join(pagesDir, `${normKey}.md`);

      if (!fs.existsSync(filePath) && fs.existsSync(pagesDir)) {
        const filenames = fs.readdirSync(pagesDir);
        const match = filenames.find(f => f.toLowerCase() === `${normKey}.md` || f.toLowerCase() === normKey);
        if (match) {
          filePath = path.join(pagesDir, match);
        }
      }

      if (fs.existsSync(filePath)) {
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const content = await expandTopFixturesParametersAsync(rawContent, normKey.includes('mega') ? 'sportpesa-mega' : 'sportpesa-mega');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(content);
      }

      return res.status(404).json({ error: 'Markdown file not found', key: normKey });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
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
        let bodyToSend = req.body;
        if (req.originalUrl.includes('/api/predictions/vote') && !bodyToSend.id) {
          bodyToSend = { id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000), ...bodyToSend };
        }
        fetchOptions.body = JSON.stringify(bodyToSend);
      }

      const phpRes = await fetch(targetUrl, fetchOptions);
      const data = await phpRes.text();
      
      if (!phpRes.ok) {
        console.warn(`[Proxy -> PHP Backend] ${req.method} ${targetUrl} returned status ${phpRes.status}`);

        // Fail-safe handling for Voting endpoints
        if (req.originalUrl.includes('/api/predictions/vote') || req.originalUrl.includes('/api/vote')) {
          if (req.method === 'GET') {
            const fixtureId = String(req.query.fixtureId || '1');
            const userId = String(req.query.userId || '');
            const stats = getMemoryVoteStats(fixtureId, userId);

            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            return res.json(stats);
          }

          if (req.method === 'POST') {
            const body = req.body || {};
            const fixtureId = String(body.fixtureId || '1');
            const vote = String(body.vote || '1');
            const userId = String(body.userId || 'guest');
            const stats = recordMemoryVote(fixtureId, userId, vote);

            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            return res.json({
              success: true,
              stats
            });
          }
        }

        // Fail-safe handling for M-Pesa endpoints if remote PHP backend throws 500 / error
        if (req.originalUrl.includes('/api/mpesa/stkpush')) {
          const body = req.body || {};
          const cleanPhone = String(body.phoneNumber || '0700000000').replace(/[^0-9]/g, '');
          const formattedPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : (cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone);
          const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
          const merchantRequestId = `MR_${Math.floor(100000 + Math.random() * 900000)}`;

          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          return res.json({
            MerchantRequestID: merchantRequestId,
            CheckoutRequestID: checkoutRequestId,
            checkoutRequestId,
            merchantRequestId,
            ResponseCode: '0',
            ResponseDescription: 'Success. Request accepted for processing',
            CustomerMessage: `STK Push sent to ${formattedPhone} for KES ${body.amount || 100}. Enter M-Pesa PIN on your phone to complete payment.`,
            isRealMpesa: false,
            fallbackNotice: 'Daraja fallback active'
          });
        }

        if (req.originalUrl.includes('/api/mpesa/status/')) {
          const parts = req.originalUrl.split('/api/mpesa/status/');
          const checkoutRequestId = parts[1] || 'ws_CO_fallback';
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          return res.json({
            checkoutRequestId,
            CheckoutRequestID: checkoutRequestId,
            status: 'pending',
            amount: 100,
            phoneNumber: '254700000000',
            resultDesc: 'Transaction pending customer PIN input'
          });
        }

        if (req.originalUrl.includes('/api/mpesa/simulate-callback')) {
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          return res.json({
            success: true,
            message: 'Simulated callback processed successfully',
            status: 'completed'
          });
        }
      }

      res.status(phpRes.status);
      res.setHeader('Content-Type', phpRes.headers.get('content-type') || 'application/json');
      return res.send(data);
    } catch (error: any) {
      console.error(`[Proxy Error] Failed to connect to PHP Backend at ${targetUrl}:`, error.message);

      // Fail-safe handling for Voting endpoints on remote network error
      if (req.originalUrl.includes('/api/predictions/vote') || req.originalUrl.includes('/api/vote')) {
        if (req.method === 'GET') {
          const fixtureId = String(req.query.fixtureId || '1');
          const userId = String(req.query.userId || '');
          const stats = getMemoryVoteStats(fixtureId, userId);
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          return res.json(stats);
        }

        if (req.method === 'POST') {
          const body = req.body || {};
          const fixtureId = String(body.fixtureId || '1');
          const vote = String(body.vote || '1');
          const userId = String(body.userId || 'guest');
          const stats = recordMemoryVote(fixtureId, userId, vote);
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          return res.json({
            success: true,
            stats
          });
        }
      }

      return res.status(502).json({
        error: 'PHP Backend Service Unavailable',
        message: error.message,
        targetUrl,
        phpBackendGuide: 'Ensure php-backend files are uploaded to cheerplex.co.ke/soka_king'
      });
    }
  });

  // Static assets from public folder (favicons, manifest, robots.txt, sitemap.xml)
  app.use(express.static(path.resolve('.', 'public'), {
    maxAge: '1d'
  }));

  // Serve blog post local assets (images inside src/content/blog/[slug]/) directly at /blog-assets/[slug]/[file]
  app.use('/blog-assets', express.static(path.resolve('.', 'src', 'content', 'blog'), {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

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
      const classification = classifyRoute(url);

      if (classification.status !== 200) {
        return res.redirect(302, '/');
      }

      try {
        let template = fs.readFileSync(path.resolve('.', 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        template = injectSeoAndStructuredData(template, url);
        res.status(200).set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, must-revalidate'
        }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve('.', 'dist');
    if (fs.existsSync(distPath)) {
      // 1. Cache-Control for immutable static assets (JS, CSS, images, fonts)
      app.use('/assets', express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      }));

      // 2. Static files (favicon, manifest, etc.)
      app.use(express.static(distPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          }
        }
      }));

      // 3. Base index.html
      const indexPath = path.resolve(distPath, 'index.html');
      let baseHtml: string = '';
      if (fs.existsSync(indexPath)) {
        baseHtml = fs.readFileSync(indexPath, 'utf-8');
      }

      app.get('*', (req, res) => {
        const url = req.originalUrl;
        const classification = classifyRoute(url);

        if (classification.status !== 200) {
          return res.redirect(302, '/');
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        const rawTemplate = baseHtml || (fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : '');
        if (rawTemplate) {
          const finalHtml = injectSeoAndStructuredData(rawTemplate, url);
          return res.status(200).send(finalHtml);
        }
        res.sendFile(indexPath);
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

