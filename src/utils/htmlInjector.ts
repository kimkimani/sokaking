import { getMarkdownContent, buildCanonicalUrl } from '../content/markdownLoader.js';
import { getPageIdFromUrl, getPageUrl } from './navigation.js';
import { generatePageJsonLd } from './schemaGenerator.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Injects SEO tags, OpenGraph metadata, and Schema.org JSON-LD structured data into the HTML response.
 */
export function injectSeoAndStructuredData(rawHtml: string, requestUrl: string): string {
  try {
    const urlPath = requestUrl.split('?')[0].split('#')[0] || '/';
    const pageId = getPageIdFromUrl(urlPath);
    const pageMd = getMarkdownContent(pageId);
    const canonicalUrl = buildCanonicalUrl(pageMd.link || getPageUrl(pageId), pageId);
    const { fullGraph } = generatePageJsonLd(pageId);

    const title = pageMd.title || 'Soka King - Premium Football Predictions & Jackpot Tips';
    const description = pageMd.description || 'Free mathematical football predictions, 1X2 tips, over 2.5 goals, BTTS/GG picks, and jackpot analysis.';
    const keywords = pageMd.keywords || 'football predictions, jackpot tips, soccer predictions';

    let html = rawHtml;

    // 1. Replace Title
    if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    } else {
      html = html.replace('</head>', `<title>${escapeHtml(title)}</title>\n</head>`);
    }

    // 2. Build Meta and JSON-LD tags
    const seoTags = `
    <!-- Soka King Server SEO & Schema.org Structured Data -->
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- Open Graph / Social Sharing -->
    <meta property="og:site_name" content="Soka King" />
    <meta property="og:type" content="${pageId === 'vip-packages' ? 'product' : 'website'}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="https://sokaking.com/icon.png" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://sokaking.com/icon.png" />

    <!-- Schema.org JSON-LD Structured Data Graph -->
    <script type="application/ld+json" id="sokaking-schema-jsonld">
${JSON.stringify(fullGraph, null, 2)}
    </script>
`;

    // 3. Insert SEO tags right before </head>
    html = html.replace('</head>', `${seoTags}\n</head>`);

    // 4. Insert Crawler Text Preview into <body> for bots
    const crawlerBlock = `
    <!-- Hidden Semantic HTML for Search Engine Web Crawlers -->
    <div id="seo-crawler-content" class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
      <h2>${escapeHtml(pageMd.displayTitle || pageMd.title)}</h2>
      <p>${escapeHtml(pageMd.description)}</p>
      ${pageMd.intro ? `<div>${escapeHtml(pageMd.intro.slice(0, 500))}</div>` : ''}
    </div>
`;
    html = html.replace('<body>', `<body>\n${crawlerBlock}`);

    return html;
  } catch (err) {
    console.error('Error injecting SEO & Structured Data into HTML:', err);
    return rawHtml;
  }
}

/**
 * Renders a strict, clean, search-engine-safe HTTP 404 or 410 response page.
 * Instructs Googlebot and other crawlers via <meta name="robots" content="noindex, nofollow" />
 * and X-Robots-Tag to permanently discard the requested path from index records.
 */
export function renderErrorPageHtml(status: 404 | 410, requestUrl: string): string {
  const is410 = status === 410;
  const title = is410 
    ? '410 Gone - Legacy Content Permanently Removed | Soka King'
    : '404 Page Not Found | Soka King';

  const heading = is410 
    ? '410: Legacy Content Permanently Removed' 
    : '404: Page Not Found';

  const message = is410 
    ? 'The requested URL was part of retired historical content or a legacy path on this domain. It has been permanently removed and will not return.'
    : 'The page you are looking for does not exist, may have moved, or is temporarily unavailable.';

  const cleanUrl = escapeHtml(requestUrl.split('?')[0]);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  
  <!-- Strict Robot Exclusion to purge legacy URLs from Google Search Index -->
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
  <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Cabinet+Grotesk:wght@700;800;900&display=swap" rel="stylesheet" />

  <style>
    :root {
      --bg: #090d16;
      --card: #0f172a;
      --border: #1e293b;
      --primary: #059669;
      --primary-hover: #047857;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      line-height: 1.5;
    }
    .error-card {
      background-color: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 580px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: ${is410 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'};
      color: ${is410 ? '#f87171' : '#fbbf24'};
      border: 1px solid ${is410 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
      margin-bottom: 16px;
    }
    h1 {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      color: var(--text);
    }
    p {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .url-chip {
      background: #020617;
      border: 1px solid var(--border);
      padding: 8px 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      color: #cbd5e1;
      word-break: break-all;
      margin-bottom: 24px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    @media (min-width: 480px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
      border: none;
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
    }
    .btn-secondary {
      background-color: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background-color: #1e293b;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <main class="error-card">
    <div class="badge">${status} ${is410 ? 'Permanently Gone' : 'Not Found'}</div>
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(message)}</p>
    <div class="url-chip">${cleanUrl}</div>
    
    <div class="actions">
      <a href="/football-predictions-today" class="btn btn-primary">Today's Predictions</a>
      <a href="/free-sportpesa-mega-jackpot-predictions-and-analysis" class="btn btn-secondary">SportPesa Mega Jackpot</a>
      <a href="/" class="btn btn-secondary">Home</a>
    </div>

    <div class="footer-note">
      Soka King Mathematical Football Predictions &copy; 2026. All rights reserved.
    </div>
  </main>
</body>
</html>`;
}
