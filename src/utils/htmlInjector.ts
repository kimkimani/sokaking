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
      <h1>${escapeHtml(pageMd.displayTitle || pageMd.title)}</h1>
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
