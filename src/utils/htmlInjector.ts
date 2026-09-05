import { getMarkdownContent, buildCanonicalUrl } from '../content/markdownLoader.js';
import { getPageIdFromUrl, getPageUrl } from './navigation.js';
import { generatePageJsonLd } from './schemaGenerator.js';
import { getBlogPostBySlug } from '../content/blogLoader.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, 'and')
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
    let pageMd = getMarkdownContent(pageId);
    let canonicalUrl = buildCanonicalUrl(pageMd.link || getPageUrl(pageId), pageId);
    const { fullGraph } = generatePageJsonLd(pageId);

    let title = pageMd.title || 'Soka King - Premium Football Predictions and Jackpot Tips';
    let description = pageMd.description || 'Free mathematical football predictions, 1X2 tips, over 2.5 goals, BTTS/GG picks, and jackpot analysis.';
    let keywords = pageMd.keywords || 'football predictions, jackpot tips, soccer predictions';
    let ogType = pageId === 'vip-packages' ? 'product' : 'website';
    let ogImage = 'https://sokaking.com/icon.png';
    let extraMetaTags = '';
    let crawlerTitle = pageMd.displayTitle || pageMd.title;
    let crawlerDesc = pageMd.description;
    let crawlerBody = pageMd.intro ? pageMd.intro.slice(0, 500) : '';

    if (pageId === 'blog') {
      title = 'Football Betting Analytics & Strategy Blog | Soka King';
      description = 'In-depth tactical breakdowns, Poisson distribution guides, SportPesa jackpot combination strategies, and quantitative bankroll models.';
      keywords = 'football analytics blog, betting strategies, expected goals xg, sportpesa jackpot combinations, poisson football model';
      canonicalUrl = 'https://sokaking.com/blog';
      crawlerTitle = 'Football Betting Analytics & Strategy Blog';
      crawlerDesc = description;
      crawlerBody = 'Discover mathematical betting models, Poisson goal distribution mechanics, Kelly criterion bankroll management, and SportPesa jackpot combination strategies.';
    } else if (pageId.startsWith('blog-')) {
      const slug = pageId.replace(/^blog-/, '');
      const blogPost = getBlogPostBySlug(slug);
      if (blogPost) {
        title = `${blogPost.title} | Soka King Football Analytics Blog`;
        description = blogPost.description;
        keywords = (blogPost.tags || []).join(', ') + ', football analytics, soka king';
        canonicalUrl = `https://sokaking.com/blog/${blogPost.slug}`;
        ogType = 'article';

        if (blogPost.coverImage) {
          if (blogPost.coverImage.startsWith('http')) {
            ogImage = blogPost.coverImage;
          } else if (blogPost.coverImage.startsWith('/')) {
            ogImage = `https://sokaking.com${blogPost.coverImage}`;
          } else {
            const clean = blogPost.coverImage.replace(/^\.\//, '');
            ogImage = `https://sokaking.com/blog-assets/${blogPost.slug}/${clean}`;
          }
        }

        const pubDate = blogPost.date.includes('T') ? blogPost.date : `${blogPost.date}T08:00:00+03:00`;
        const authorName = blogPost.author?.name || 'John K. Mwangi';
        extraMetaTags = `
    <!-- Article Specific Metadata for Google Discover & Social Networks -->
    <meta property="article:published_time" content="${pubDate}" />
    <meta property="article:author" content="${escapeHtml(authorName)}" />
    <meta property="article:section" content="${escapeHtml(blogPost.category || 'Football Analytics')}" />
    ${(blogPost.tags || []).map(t => `<meta property="article:tag" content="${escapeHtml(t)}" />`).join('\n    ')}`;

        crawlerTitle = blogPost.title;
        crawlerDesc = blogPost.description;
        crawlerBody = blogPost.content ? blogPost.content.slice(0, 1000) : '';
      }
    }

    let html = rawHtml;

    // 1. Replace Title
    if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    } else {
      html = html.replace('</head>', `<title>${escapeHtml(title)}</title>\n</head>`);
    }

    // 2. Build Meta and JSON-LD tags
    const seoTags = `
    <!-- Soka King Server SEO and Schema.org Structured Data -->
    <meta name="google-site-verification" content="QZkU02Oxl2MsbWtxkg9zgF79m7ek94D6-2V0pvR9tmE" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- Open Graph / Social Sharing -->
    <meta property="og:site_name" content="Soka King" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    ${extraMetaTags}
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />

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
      <h2>${escapeHtml(crawlerTitle)}</h2>
      <p>${escapeHtml(crawlerDesc)}</p>
      ${crawlerBody ? `<div>${escapeHtml(crawlerBody)}</div>` : ''}
    </div>
`;
    html = html.replace('<body>', `<body>\n${crawlerBlock}`);

    // 5. Transform Render-Blocking Stylesheets into Non-Blocking Preloads (with noscript fallback)
    html = html.replace(/<link\s+rel="stylesheet"\s+([^>]*?)href="([^"]+\.css)"([^>]*)>/gi, (match, before, href, after) => {
      return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" ${before}${after}><noscript><link rel="stylesheet" href="${href}" ${before}${after}></noscript>`;
    });

    return html;
  } catch (err) {
    console.error('Error injecting SEO and Structured Data into HTML:', err);
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
      <a href="/free-sportpesa-mega-jackpot-prediction" class="btn btn-secondary">SportPesa Mega Jackpot</a>
      <a href="/" class="btn btn-secondary">Home</a>
    </div>

    <div class="footer-note">
      Soka King Mathematical Football Predictions &copy; 2026. All rights reserved.
    </div>
  </main>
</body>
</html>`;
}
