import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { generateSitemapXml, getAllSitemapRoutes, BASE_URL } from './src/utils/sitemapGenerator.js';
import { 
  createPendingTransaction, 
  completeTransaction, 
  claimManualReceipt, 
  getTransactionByCheckoutId, 
  getAllMpesaTransactions,
  getAllPurchases,
  getAllSubscriptions
} from './src/utils/mpesaDb.js';

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

  // Serve dynamic live Markdown directly from src/content/pages/
  app.get('/api/markdown', (req, res) => {
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
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(content);
      }

      return res.status(404).json({ error: 'Markdown file not found', key: normKey });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // -----------------------------------------------------------------
  // M-Pesa API Routes & Persistent Database Processing
  // -----------------------------------------------------------------

  // 1. M-Pesa STK Push
  app.post('/api/mpesa/stkpush', (req, res) => {
    try {
      const body = req.body || {};
      const { phoneNumber, amount, itemType, itemId, uid } = body;

      if (!phoneNumber || !amount || !itemType || !itemId) {
        return res.status(400).json({ error: 'phoneNumber, amount, itemType and itemId are required' });
      }

      const rawPhone = String(phoneNumber).replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : (rawPhone.startsWith('254') ? rawPhone : '254' + rawPhone);
      const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const merchantRequestId = `MR_${Math.floor(100000 + Math.random() * 900000)}`;
      const userId = uid && uid !== 'guest' ? uid : cleanPhone;

      // RECORD IN DATABASE IMMEDIATELY
      const tx = createPendingTransaction({
        userId,
        checkoutRequestId,
        merchantRequestId,
        phoneNumber: cleanPhone,
        amount: Number(amount),
        itemType: String(itemType),
        itemId: String(itemId),
      });

      return res.status(200).json({
        MerchantRequestID: merchantRequestId,
        CheckoutRequestID: checkoutRequestId,
        checkoutRequestId,
        merchantRequestId,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: `STK Push sent to ${cleanPhone} for KES ${amount}. Enter M-Pesa PIN on your phone to complete payment.`,
        isRealMpesa: false,
        dbRecordId: tx.id
      });
    } catch (err: any) {
      console.error('[M-Pesa STK Push Error]:', err);
      return res.status(500).json({ error: 'Failed to process STK push request', message: err.message });
    }
  });

  // 2. M-Pesa Simulate Callback (PIN Entry / Sandbox Approval)
  app.post('/api/mpesa/simulate-callback', (req, res) => {
    try {
      const { checkoutRequestId, success, receiptCode } = req.body || {};
      if (!checkoutRequestId) {
        return res.status(400).json({ error: 'checkoutRequestId is required' });
      }

      const tx = completeTransaction(String(checkoutRequestId), success !== false, receiptCode);

      return res.status(200).json({
        success: true,
        message: 'Transaction status updated successfully',
        status: tx ? tx.status : 'completed',
        receiptNumber: tx ? tx.mpesa_receipt_number : null,
        transaction: tx
      });
    } catch (err: any) {
      console.error('[M-Pesa Simulate Callback Error]:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. M-Pesa Transaction Status Polling
  app.get('/api/mpesa/status/:checkoutRequestId', (req, res) => {
    try {
      const { checkoutRequestId } = req.params;
      const tx = getTransactionByCheckoutId(checkoutRequestId);

      if (tx) {
        return res.status(200).json({
          checkoutRequestId: tx.checkout_request_id,
          CheckoutRequestID: tx.checkout_request_id,
          status: tx.status,
          amount: tx.amount,
          phoneNumber: tx.phone_number,
          itemType: tx.item_type,
          itemId: tx.item_id,
          mpesaReceiptNumber: tx.mpesa_receipt_number,
          resultDesc: tx.result_desc || 'Transaction in progress'
        });
      }

      return res.status(200).json({
        checkoutRequestId,
        CheckoutRequestID: checkoutRequestId,
        status: 'pending',
        amount: 100,
        phoneNumber: '254700000000',
        resultDesc: 'Transaction pending customer PIN input'
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. M-Pesa Claim Manual Paybill Code
  app.post('/api/mpesa/claim-code', (req, res) => {
    try {
      const { receiptCode, phoneNumber, packageId, packageType, packageName } = req.body || {};
      if (!receiptCode || !phoneNumber) {
        return res.status(400).json({ error: 'receiptCode and phoneNumber are required' });
      }

      const tx = claimManualReceipt({
        receiptCode: String(receiptCode),
        phoneNumber: String(phoneNumber),
        packageId: String(packageId || 'VIP_WEEKLY'),
        packageType: String(packageType || 'vip_package'),
        packageName: packageName ? String(packageName) : undefined
      });

      return res.status(200).json({
        success: true,
        message: 'Receipt code claimed and unlocked successfully',
        receiptCode: tx.mpesa_receipt_number,
        transaction: tx
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. Get All M-Pesa Database Transactions (Admin & Audit)
  app.get('/api/mpesa/transactions', (_req, res) => {
    try {
      const transactions = getAllMpesaTransactions();
      return res.status(200).json(transactions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Get All Purchases & Subscriptions
  app.get('/api/purchases', (_req, res) => {
    try {
      const purchases = getAllPurchases();
      return res.status(200).json(purchases);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sms/subscriptions', (_req, res) => {
    try {
      const subscriptions = getAllSubscriptions();
      return res.status(200).json(subscriptions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Proxy /api requests to PHP Backend Server for non-M-Pesa routes
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

      res.status(phpRes.status);
      res.setHeader('Content-Type', phpRes.headers.get('content-type') || 'application/json');
      return res.send(data);
    } catch (error: any) {
      console.error(`[Proxy Error] Failed to connect to PHP Backend at ${targetUrl}:`, error.message);
      return res.status(502).json({
        error: 'PHP Backend Service Unavailable',
        message: error.message,
        targetUrl
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

