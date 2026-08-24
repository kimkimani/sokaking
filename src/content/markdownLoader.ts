import { RAW_MARKDOWN_MAP } from './markdownData';
import { PAGE_METADATA_MAP, PageMetadata } from './pageMetadata';
import { getAuthor, ParsedAuthor } from './authorLoader';

export interface ParsedMarkdownPage extends PageMetadata {
  author?: ParsedAuthor;
  intro: string;
  middle: string;
  meat: string;
  faq: string;
  fullContent: string;
}

/**
 * Cleanly builds absolute canonical URL for any path or page key.
 */
export function buildCanonicalUrl(linkOrPath?: string, fallbackId?: string): string {
  const BASE_DOMAIN = 'https://sokaking.com';
  let raw = (linkOrPath || (fallbackId ? `/${fallbackId}` : '/')).trim();

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const parsed = new URL(raw);
      raw = parsed.pathname;
    } catch {
      raw = '/';
    }
  }

  if (!raw.startsWith('/')) {
    raw = '/' + raw;
  }
  if (raw.endsWith('/') && raw !== '/') {
    raw = raw.slice(0, -1);
  }

  return `${BASE_DOMAIN}${raw}`;
}

/**
 * Reads physical markdown file from src/content/pages in Node.js server environment directly from disk.
 * Guarantees that any updates to .md files are immediately picked up without restart.
 */
function readServerPageFile(pageKey: string): string | null {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
      const cleanKey = pageKey.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
      if (!cleanKey) return null;

      const directFile = path.join(pagesDir, `${cleanKey}.md`);
      if (fs.existsSync(directFile)) {
        return fs.readFileSync(directFile, 'utf-8');
      }

      if (fs.existsSync(pagesDir)) {
        const filenames = fs.readdirSync(pagesDir);
        for (const file of filenames) {
          if (file.toLowerCase() === `${cleanKey}.md` || file.toLowerCase() === cleanKey) {
            return fs.readFileSync(path.join(pagesDir, file), 'utf-8');
          }
        }
      }
    } catch (e) {
      // fs is unavailable in client environments
    }
  }
  return null;
}

export function normalizePageKey(pageKey: string): string {
  let rawKey = (pageKey || '').toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
  if (!rawKey) return 'home';

  let key = rawKey;
  if (key === 'today' || key === 'football-predictions-today') key = 'category-today';
  if (key === 'tomorrow' || key === 'football-predictions-tomorrow') key = 'category-tomorrow';
  if (key === 'yesterday' || key === 'football-predictions-yesterday') key = 'category-yesterday';
  if (key === 'over15' || key === 'over-1-5' || key === 'football-predictions-over-1-5-goals') key = 'category-over15';
  if (key === 'over25' || key === 'over-2-5' || key === 'football-predictions-over-2-5-goals') key = 'category-over25';
  if (key === 'btts' || key === 'gg' || key === 'football-predictions-btts-gg') key = 'category-btts';
  if (key === 'doublechance' || key === 'double-chance' || key === 'football-predictions-double-chance') key = 'category-doublechance';
  if (key === 'homewin' || key === 'home-win' || key === '1x2' || key === 'football-predictions-1x2-home-win') key = 'category-homewin';
  if (key === 'about-us') key = 'about';
  if (key === 'contact-us') key = 'contact';
  if (key === 'privacy') key = 'privacy-policy';
  if (key === 'terms') key = 'terms-of-use';
  if (key === 'vip' || key === 'vip-tips' || key === 'odds') key = 'vip-packages';
  if (key === 'jackpot-tips') key = 'jackpot-list';
  return key;
}

export function getPageMetadata(pageKey: string): PageMetadata {
  const normKey = normalizePageKey(pageKey);
  if (PAGE_METADATA_MAP[normKey]) {
    return PAGE_METADATA_MAP[normKey];
  }
  return {
    pageKey: normKey,
    title: 'Soka King | Free Football Predictions & Jackpot Tips',
    displayTitle: 'Free Football Predictions',
    description: 'Free football predictions, jackpot tips, and betting analysis.',
    keywords: 'football predictions, jackpot tips, soccer predictions',
    link: `/${normKey}`,
    listTitle: "Today's Free Football Predictions",
    listSubtitle: "High-probability daily double-chance options and standard single tips verified by Soka King mathematical indexes."
  };
}

function loadRawMarkdown(pageKey: string): string {
  const key = normalizePageKey(pageKey);

  // 0. Server-side filesystem read of src/content/pages/ (Primary Source of Truth on Server)
  if (typeof window === 'undefined') {
    const serverContent = readServerPageFile(key);
    if (serverContent) {
      return serverContent;
    }
  }

  // 1. Fallback to RAW_MARKDOWN_MAP
  if (RAW_MARKDOWN_MAP[key]) {
    return RAW_MARKDOWN_MAP[key];
  }

  return '# Soka King\n\nExpert Football Predictions and Analysis';
}

export function parseMarkdownPage(rawMd: string, keyName: string = ''): ParsedMarkdownPage {
  const meta = getPageMetadata(keyName);

  // Strip YAML frontmatter & comment frontmatter from body
  let cleanedContent = rawMd.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*/, '').trim();
  cleanedContent = cleanedContent.replace(/<!--\s*(Title|DisplayTitle|PageTitle|Description|Keywords|Link|Type|JackpotId|AuthorName|AuthorTitle|AuthorDescription|AuthorAvatar|ResponsibleGambling|InboundTitle|InboundHeading|InboundDescription|InboundSubtitle|InboundBadge|RelatedTitle|RelatedHeading|RelatedDescription|RelatedSubtitle|RelatedBadge|UnlockHeading|UnlockDescription|ListTitle|ListSubtitle):\s*.+?\s*-->/gi, '').trim();

  // Extract RESPONSIBLE_GAMBLING_START ... RESPONSIBLE_GAMBLING_END block if present
  let responsibleGambling = meta.responsibleGambling || '';
  const rgBlockMatch = rawMd.match(/<!--\s*RESPONSIBLE_GAMBLING_START\s*-->([\s\S]*?)<!--\s*RESPONSIBLE_GAMBLING_END\s*-->/i);
  if (rgBlockMatch) {
    const extractedRgBlock = rgBlockMatch[1].trim();
    if (extractedRgBlock) {
      responsibleGambling = extractedRgBlock;
    }
  }
  cleanedContent = cleanedContent.replace(/<!--\s*RESPONSIBLE_GAMBLING_START\s*-->[\s\S]*?<!--\s*RESPONSIBLE_GAMBLING_END\s*-->/gi, '').trim();

  // Strip top H1 heading lines (`# ...`) from the body so they don't produce a second duplicate title
  cleanedContent = cleanedContent.replace(/^#\s+[^\r\n]+$/gm, '').trim();

  // Extract INTRO, MIDDLE, MEAT, FAQ sections robustly using position indexing
  const tags = [
    { name: 'intro', regex: /(?:<!--\s*INTRO\s*-->|^#{1,4}\s*INTRO\s*$)/im },
    { name: 'middle', regex: /(?:<!--\s*(?:MIDDLE|MIDDLE_CONTENT)\s*-->|^#{1,4}\s*(?:MIDDLE|MIDDLE_CONTENT)\s*$)/im },
    { name: 'meat', regex: /(?:<!--\s*(?:MEAT|MEAT_CONTENT)\s*-->|^#{1,4}\s*(?:MEAT|MEAT_CONTENT)\s*$)/im },
    { name: 'faq', regex: /(?:<!--\s*FAQ\s*-->|^#{1,4}\s*FAQ\s*$)/im },
  ];

  const matches: { name: string; index: number; length: number }[] = [];
  for (const t of tags) {
    const m = t.regex.exec(cleanedContent);
    if (m) {
      matches.push({ name: t.name, index: m.index, length: m[0].length });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  let intro = '';
  let middle = '';
  let meat = '';
  let faq = '';

  if (matches.length === 0) {
    meat = cleanedContent;
  } else {
    const firstContent = cleanedContent.substring(0, matches[0].index).trim();

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].index : cleanedContent.length;
      const sectionContent = cleanedContent.substring(current.index + current.length, nextIndex).trim();

      if (current.name === 'intro') intro = sectionContent.replace(/^##\s+[^\r\n]+(?:\r?\n)*/m, '').trim();
      else if (current.name === 'middle') middle = sectionContent;
      else if (current.name === 'meat') meat = sectionContent;
      else if (current.name === 'faq') faq = sectionContent;
    }

    if (!intro && firstContent) intro = firstContent;
    if (!meat && !middle && firstContent) meat = firstContent;
  }

  const resolvedAuthor = getAuthor(meta.authorId || meta.authorName || 'john-mwangi');

  return {
    ...meta,
    author: resolvedAuthor,
    responsibleGambling: responsibleGambling || undefined,
    intro,
    middle,
    meat: meat || cleanedContent,
    faq,
    fullContent: cleanedContent,
  };
}

export function getMarkdownContent(pageKey: string): ParsedMarkdownPage {
  const raw = loadRawMarkdown(pageKey);
  return parseMarkdownPage(raw, pageKey);
}

/**
 * Asynchronously fetches live markdown from the server endpoint if running in browser client.
 * Guarantees real-time reflection of markdown file updates on client navigation.
 */
export async function fetchLiveMarkdownContent(pageKey: string): Promise<ParsedMarkdownPage> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/markdown?key=${encodeURIComponent(pageKey)}`, { cache: 'no-store' });
      if (res.ok) {
        const rawMd = await res.text();
        if (rawMd && rawMd.length > 5) {
          return parseMarkdownPage(rawMd, pageKey);
        }
      }
    } catch (e) {
      // Fallback silently to synchronous loader
    }
  }
  return getMarkdownContent(pageKey);
}

/**
 * Returns all parsed markdown pages using pre-parsed metadata.
 */
export function getAllMarkdownPages(): { pageKey: string; page: ParsedMarkdownPage }[] {
  return Object.keys(PAGE_METADATA_MAP).map(key => ({
    pageKey: key,
    page: getMarkdownContent(key)
  }));
}

/**
 * Dynamically constructs URL_TO_PAGE_MAP and PAGE_TO_URL_MAP instantly from pre-parsed metadata.
 */
export function getDynamicUrlMaps(
  baseUrlToPageMap: Record<string, string>,
  basePageToUrlMap: Record<string, string>
) {
  const urlToPageMap: Record<string, string> = { ...baseUrlToPageMap };
  const pageToUrlMap: Record<string, string> = { ...basePageToUrlMap };
  const dynamicCategoryPages: Record<string, any> = {};
  const dynamicJackpotPages: Record<string, { pageKey: string; jackpotId: string; name: string; link: string; page?: any }> = {};

  for (const [pageKey, meta] of Object.entries(PAGE_METADATA_MAP)) {
    if (meta.link) {
      let normLink = meta.link.toLowerCase().trim();
      if (!normLink.startsWith('/')) {
        normLink = '/' + normLink;
      }
      if (normLink.endsWith('/') && normLink !== '/') {
        normLink = normLink.slice(0, -1);
      }
      urlToPageMap[normLink] = pageKey;
      pageToUrlMap[pageKey] = normLink;
    } else {
      const defaultPath = `/${pageKey}`;
      if (!urlToPageMap[defaultPath]) {
        urlToPageMap[defaultPath] = pageKey;
      }
      if (!pageToUrlMap[pageKey]) {
        pageToUrlMap[pageKey] = defaultPath;
      }
    }

    // 1. Dynamic Competitor / Category Discovery
    const isCompetitorOrCategory = 
      meta.type === 'competitor' ||
      meta.type === 'category' ||
      pageKey.includes('predict') ||
      pageKey.includes('vista') ||
      pageKey.includes('tips') ||
      pageKey.includes('sure-') ||
      pageKey.startsWith('category-');

    if (isCompetitorOrCategory && meta.type !== 'jackpot' && meta.type !== 'static') {
      dynamicCategoryPages[pageKey] = {
        id: pageKey,
        name: meta.displayTitle || meta.title || pageKey,
        label: meta.displayTitle || meta.title || pageKey,
        countText: 'Tips',
        description: meta.description || '',
        icon: meta.icon || '⚡',
        badgeColor: meta.badgeColor || 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        isDynamicCompetitor: true
      };
    }

    // 2. Dynamic Jackpot Discovery
    if (meta.type === 'jackpot' || meta.jackpotId) {
      const resolvedJackpotId = meta.jackpotId || pageKey;
      dynamicJackpotPages[pageKey] = {
        pageKey,
        jackpotId: resolvedJackpotId,
        name: meta.displayTitle || meta.title || pageKey,
        link: meta.link || `/${pageKey}`,
      };
    }
  }

  return { 
    urlToPageMap, 
    pageToUrlMap, 
    dynamicCategoryPages, 
    dynamicJackpotPages,
    dynamicCategoryIds: Object.keys(dynamicCategoryPages),
    dynamicJackpotIds: Object.keys(dynamicJackpotPages)
  };
}




