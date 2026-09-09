import { getAllSitemapRoutes, getMarkdownRoutesSet } from './sitemapGenerator.js';
import { URL_TO_PAGE_MAP, PAGE_TO_URL_MAP, getNormalizedPath, getPageUrl, getPageIdFromUrl } from './navigation.js';
import { BLOG_METADATA_LIST } from '../content/blogData.js';
import { getBlogPostBySlug } from '../content/blogLoader.js';

export interface RouteStatusResult {
  status: 200 | 301 | 404 | 410;
  isSpamPattern: boolean;
  pageId: string | null;
  redirectTo?: string;
  reason?: string;
}

/**
 * Common legacy spam keywords and patterns from expired domains, PBNs, 
 * Japanese keyword hacks, foreign casino directories, old CMS paths, etc.
 */
const LEGACY_SPAM_REGEX_PATTERNS: RegExp[] = [
  // 1. Script and executable extensions
  /\.(php[0-9]?|phtml|asp|aspx|cgi|pl|jsp|cfm|shtml|action|do|exe|dll|bin|sh|py|cgi)$/i,
  
  // 2. Old CMS / WordPress / Joomla remnants
  /^\/(wp-admin|wp-includes|wp-content|wp-json|xmlrpc\.php|wp-login\.php|wp-cron\.php|wp-signup\.php)/i,
  /^\/(administrator|joomla|drupal|typo3|bitrix|magento|vbulletin|xenforo)/i,
  
  // 3. RSS / Feeds / Trackbacks
  /^\/(feed|rss|atom|trackback|comments\/feed)/i,
  /\/feed\/?$/i,
  
  // 4. Casino / Adult / Pharma spam paths
  /\/(casino|slot|slots|poker|roulette|blackjack|judi|togel|sbobet|slot88|gacor|maxwin|zeus|pragmatic|jackpot-online|depo-pulsa|link-gacor)/i,
  /\/(viagra|cialis|levitra|pharmacy|drugs|pills|meds|prescription|buy-online)/i,
  /\/(porn|sex|xxx|adult|erotic|escort|nude|dating|cam|live-cams)/i,
  
  // 5. Scraper / Download / Torrent / Warez
  /\/(free-download|download-|crack-|keygen|torrent|warez|serial-key|nulled|pirate|apk-mod)/i,
  /\/(buy-cheap|cheap-|discount-|coupon-|promo-code-|best-price-)/i,
  
  // 6. Generic E-commerce / Cart / Shop on former e-commerce domains
  /^\/(shop|products?|cart|checkout|item|items|catalog|collections?|store)\//i,
  
  // 7. Old WordPress tag, category, and date archives
  /^\/tag\//i,
  /^\/category\/(?!today|yesterday|tomorrow|over15|over25|btts|homewin|doublechance)[a-z0-9_-]+/i,
  /^\/archive\//i,
  /^\/author\/(admin|user|root|test|moderator|webmaster)/i,
  /^\/20(0\d|1\d|2[0-5])\/\d{2}(\/\d{2})?\//i, // e.g. /2018/04/post-name or /2021/11/
  
  // 8. Forum / BBS / Discussion boards
  /^\/(forum|forums|thread|threads|topic|topics|bbs|board|viewtopic|showthread)\b/i,
  
  // 9. Japanese / Foreign keyword hack characters in URL path
  /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/
];

/**
 * Valid static asset extensions that should bypass HTML routing
 */
const STATIC_ASSET_EXTENSIONS = new Set([
  'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
  'woff', 'woff2', 'ttf', 'eot', 'json', 'xml', 'txt', 'map', 'webmanifest'
]);

/**
 * Inspects an incoming URL path and classifies it for HTTP status and search engine handling.
 * 
 * - Valid canonical routes -> HTTP 200
 * - Aliases, legacy URLs, or non-canonical slugs -> HTTP 301 Permanent Redirect to canonical URL
 * - Legacy spam / deprecated historical URL patterns -> HTTP 410 (Gone) to rapidly drop from Google index
 * - Unknown non-existent routes -> HTTP 404 (Not Found)
 */
export function classifyRoute(rawUrl: string): RouteStatusResult {
  const cleanPath = (rawUrl.split('?')[0].split('#')[0] || '/').trim();
  const normalized = getNormalizedPath(cleanPath);

  // 1. If path has uppercase letters or trailing slash (and isn't root), redirect 301 to normalized
  if (cleanPath !== '/' && cleanPath !== normalized) {
    return {
      status: 301,
      isSpamPattern: false,
      pageId: null,
      redirectTo: normalized,
      reason: 'Redirect to normalized lowercase non-trailing-slash URL'
    };
  }

  // 2. Check if it's the home page
  if (normalized === '/') {
    return {
      status: 200,
      isSpamPattern: false,
      pageId: 'home'
    };
  }

  // 3. Check if it is the blog index or a blog post
  if (normalized === '/blog') {
    return {
      status: 200,
      isSpamPattern: false,
      pageId: 'blog'
    };
  }
  if (normalized.startsWith('/blog/')) {
    const slug = normalized.replace(/^\/blog\/?/, '').trim();
    if (!slug) {
      return {
        status: 301,
        isSpamPattern: false,
        pageId: 'blog',
        redirectTo: '/blog',
        reason: 'Redirect /blog/ to canonical /blog'
      };
    }

    // Explicitly return 410 Gone for legacy deleted blog posts to purge from search engines
    const DELETED_BLOG_SLUGS = new Set([
      'bankroll-management-for-football-bettors',
      'mastering-expected-goals-xg-football-predictions',
      'sportpesa-mega-jackpot-combination-strategies',
      'sportpesa-midweek-jackpot-13-game-tactics',
      'spotting-high-value-draws-in-european-leagues',
      'under-over-goals-market-statistical-edges'
    ]);
    if (DELETED_BLOG_SLUGS.has(slug)) {
      return {
        status: 410,
        isSpamPattern: false,
        pageId: null,
        reason: 'Blog post has been permanently removed'
      };
    }

    const post = getBlogPostBySlug(slug);
    const existsInList = Array.isArray(BLOG_METADATA_LIST) && BLOG_METADATA_LIST.some(item => item.slug === slug);
    if (post || existsInList) {
      return {
        status: 200,
        isSpamPattern: false,
        pageId: `blog-${post?.slug || slug}`
      };
    }

    return {
      status: 404,
      isSpamPattern: false,
      pageId: null,
      reason: 'Blog post not found'
    };
  }

  // 4. Resolve pageId and enforce strict single canonical URL
  const pageId = getPageIdFromUrl(normalized);
  if (pageId && pageId !== 'home') {
    const canonicalUrl = getPageUrl(pageId);

    // If accessed via an alias, old path, or non-canonical slug, 301 redirect to the single true canonical URL
    if (canonicalUrl && normalized !== canonicalUrl) {
      return {
        status: 301,
        isSpamPattern: false,
        pageId,
        redirectTo: canonicalUrl,
        reason: `Enforcing single canonical link: ${normalized} -> ${canonicalUrl}`
      };
    }

    return {
      status: 200,
      isSpamPattern: false,
      pageId
    };
  }

  // 5. Check if it matches known legacy spam patterns from expired domain history
  for (const pattern of LEGACY_SPAM_REGEX_PATTERNS) {
    if (pattern.test(cleanPath) || pattern.test(normalized)) {
      return {
        status: 410,
        isSpamPattern: true,
        pageId: null,
        reason: `Legacy spam pattern matched: ${pattern.toString()}`
      };
    }
  }

  // 6. Query string spam inspection (e.g. ?p=123, ?id=xxx, ?page=xxx on non-existent endpoints)
  const queryString = rawUrl.includes('?') ? rawUrl.split('?')[1] : '';
  if (queryString) {
    if (
      /(p=\d+|cat=\d+|page_id=\d+|author=\d+|replytocom=|aff_|ref=spam|option=com_)/i.test(queryString) ||
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/.test(queryString)
    ) {
      return {
        status: 410,
        isSpamPattern: true,
        pageId: null,
        reason: 'Legacy query string spam signature'
      };
    }
  }

  // 7. Check if it looks like an old dead file extension
  const extensionMatch = normalized.match(/\.([a-z0-9]+)$/i);
  if (extensionMatch) {
    const ext = extensionMatch[1].toLowerCase();
    if (!STATIC_ASSET_EXTENSIONS.has(ext)) {
      return {
        status: 410,
        isSpamPattern: true,
        pageId: null,
        reason: `Legacy non-supported file extension .${ext}`
      };
    }
  }

  // 8. General non-existent route -> HTTP 404
  return {
    status: 404,
    isSpamPattern: false,
    pageId: null,
    reason: 'Route does not exist'
  };
}
