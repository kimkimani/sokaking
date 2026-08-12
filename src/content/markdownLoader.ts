import { RAW_MARKDOWN_MAP } from './markdownData';

const pageMarkdownFiles = (typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function')
  ? (import.meta as any).glob('./pages/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
  : {};

export interface ParsedMarkdownPage {
  pageKey?: string;
  title: string;             // SEO title
  displayTitle?: string;     // Display title on page
  description: string;
  keywords: string;
  link: string;
  type?: 'competitor' | 'jackpot' | 'category' | 'static' | 'custom';
  jackpotId?: string;
  fixturesCategory?: string;
  icon?: string;
  badgeColor?: string;

  authorName?: string;
  authorTitle?: string;
  authorDescription?: string;
  authorAvatar?: string;

  responsibleGambling?: string;

  miniIntro?: string;
  unlockHeading?: string;
  unlockDescription?: string;
  listTitle?: string;
  listSubtitle?: string;

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

function loadRawMarkdown(pageKey: string): string {
  let rawKey = (pageKey || '').toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
  if (!rawKey) rawKey = 'home';

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

  // 0. Server-side filesystem read of src/content/pages/ (Primary Source of Truth on Server)
  if (typeof window === 'undefined') {
    const serverContent = readServerPageFile(key) || readServerPageFile(rawKey);
    if (serverContent) {
      return serverContent;
    }
  }

  // 1. Direct check of eager glob of ./pages/*.md
  const fileKey = `./pages/${key}.md`;
  if (pageMarkdownFiles[fileKey]) {
    return pageMarkdownFiles[fileKey];
  }

  const rawFileKey = `./pages/${rawKey}.md`;
  if (pageMarkdownFiles[rawFileKey]) {
    return pageMarkdownFiles[rawFileKey];
  }

  // 2. Case-insensitive check of eager glob
  for (const fk of Object.keys(pageMarkdownFiles)) {
    const pk = fk.replace(/^\.\/pages\//, '').replace(/\.md$/, '').toLowerCase();
    if (pk === key || pk === rawKey) {
      return pageMarkdownFiles[fk];
    }
  }

  // 3. Fallback to RAW_MARKDOWN_MAP
  if (RAW_MARKDOWN_MAP[key]) {
    return RAW_MARKDOWN_MAP[key];
  }

  if (RAW_MARKDOWN_MAP[rawKey]) {
    return RAW_MARKDOWN_MAP[rawKey];
  }

  return '# Soka King\n\nExpert Football Predictions and Analysis';
}

export function parseMarkdownPage(rawMd: string, keyName: string = ''): ParsedMarkdownPage {
  let title = 'Soka King | Free Football Predictions & Jackpot Tips';
  let displayTitle = '';
  let description = 'Free football predictions, jackpot tips, and betting analysis.';
  let keywords = 'football predictions, jackpot tips, soccer predictions';
  let link = keyName ? `/${keyName}` : '/';
  let type: ParsedMarkdownPage['type'] = undefined;
  let jackpotId: string | undefined = undefined;
  let fixturesCategory: string | undefined = undefined;
  let icon: string | undefined = undefined;
  let badgeColor: string | undefined = undefined;

  let authorName = '';
  let authorTitle = '';
  let authorDescription = '';
  let authorAvatar = '';
  let responsibleGambling = '';
  let miniIntro = '';
  let unlockHeading = '';
  let unlockDescription = '';
  let listTitle = '';
  let listSubtitle = '';

  // 1. Extract YAML frontmatter if present (between --- and ---)
  const yamlMatch = rawMd.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (yamlMatch) {
    const yamlStr = yamlMatch[1];
    const titleY = yamlStr.match(/^title:\s*"?(.*?)"?$/m);
    if (titleY) title = titleY[1].trim();

    const dtY = yamlStr.match(/^(?:displayTitle|pageTitle):\s*"?(.*?)"?$/m);
    if (dtY) displayTitle = dtY[1].trim();

    const descY = yamlStr.match(/^description:\s*"?(.*?)"?$/m);
    if (descY) description = descY[1].trim();

    const kwY = yamlStr.match(/^keywords:\s*"?(.*?)"?$/m);
    if (kwY) keywords = kwY[1].trim();

    const linkY = yamlStr.match(/^link:\s*"?(.*?)"?$/m);
    if (linkY) link = linkY[1].trim();

    const typeY = yamlStr.match(/^type:\s*"?(.*?)"?$/m);
    if (typeY) type = typeY[1].trim() as any;

    const jidY = yamlStr.match(/^(?:jackpotId|jackpot_id):\s*"?(.*?)"?$/m);
    if (jidY) jackpotId = jidY[1].trim();

    const fcY = yamlStr.match(/^(?:fixturesCategory|category):\s*"?(.*?)"?$/m);
    if (fcY) fixturesCategory = fcY[1].trim();

    const iconY = yamlStr.match(/^icon:\s*"?(.*?)"?$/m);
    if (iconY) icon = iconY[1].trim();

    const bcY = yamlStr.match(/^(?:badgeColor|badge_color):\s*"?(.*?)"?$/m);
    if (bcY) badgeColor = bcY[1].trim();

    const anY = yamlStr.match(/^(?:authorName|author_name):\s*"?(.*?)"?$/m);
    if (anY) authorName = anY[1].trim();

    const atY = yamlStr.match(/^(?:authorTitle|author_title):\s*"?(.*?)"?$/m);
    if (atY) authorTitle = atY[1].trim();

    const adY = yamlStr.match(/^(?:authorDescription|author_description):\s*"?(.*?)"?$/m);
    if (adY) authorDescription = adY[1].trim();

    const aaY = yamlStr.match(/^(?:authorAvatar|author_avatar):\s*"?(.*?)"?$/m);
    if (aaY) authorAvatar = aaY[1].trim();

    const rgY = yamlStr.match(/^(?:responsibleGambling|responsible_gambling|responsibleGamblingNotice):\s*"?(.*?)"?$/m);
    if (rgY) responsibleGambling = rgY[1].trim();

    const miY = yamlStr.match(/^(?:miniIntro|mini_intro):\s*"?(.*?)"?$/m);
    if (miY) miniIntro = miY[1].trim();

    const uhY = yamlStr.match(/^unlockHeading:\s*"?(.*?)"?$/m);
    if (uhY) unlockHeading = uhY[1].trim();

    const udY = yamlStr.match(/^unlockDescription:\s*"?(.*?)"?$/m);
    if (udY) unlockDescription = udY[1].trim();

    const ltY = yamlStr.match(/^listTitle:\s*"?(.*?)"?$/m);
    if (ltY) listTitle = ltY[1].trim();

    const lsY = yamlStr.match(/^listSubtitle:\s*"?(.*?)"?$/m);
    if (lsY) listSubtitle = lsY[1].trim();
  }

  // 2. Extract HTML frontmatter comments if present
  const titleMatch = rawMd.match(/<!--\s*Title:\s*(.+?)\s*-->/i);
  if (titleMatch) title = titleMatch[1].trim();

  const dtMatch = rawMd.match(/<!--\s*(?:DisplayTitle|PageTitle):\s*(.+?)\s*-->/i);
  if (dtMatch) displayTitle = dtMatch[1].trim();

  const descMatch = rawMd.match(/<!--\s*Description:\s*(.+?)\s*-->/i);
  if (descMatch) description = descMatch[1].trim();

  const kwMatch = rawMd.match(/<!--\s*Keywords:\s*(.+?)\s*-->/i);
  if (kwMatch) keywords = kwMatch[1].trim();

  const linkMatch = rawMd.match(/<!--\s*Link:\s*(.+?)\s*-->/i);
  if (linkMatch) link = linkMatch[1].trim();

  const typeMatch = rawMd.match(/<!--\s*Type:\s*(.+?)\s*-->/i);
  if (typeMatch) type = typeMatch[1].trim() as any;

  const jidMatch = rawMd.match(/<!--\s*(?:JackpotId|Jackpot_Id):\s*(.+?)\s*-->/i);
  if (jidMatch) jackpotId = jidMatch[1].trim();

  const anMatch = rawMd.match(/<!--\s*(?:AuthorName|Author_Name):\s*(.+?)\s*-->/i);
  if (anMatch) authorName = anMatch[1].trim();

  const atMatch = rawMd.match(/<!--\s*(?:AuthorTitle|Author_Title):\s*(.+?)\s*-->/i);
  if (atMatch) authorTitle = atMatch[1].trim();

  const adMatch = rawMd.match(/<!--\s*(?:AuthorDescription|Author_Description):\s*(.+?)\s*-->/i);
  if (adMatch) authorDescription = adMatch[1].trim();

  const aaMatch = rawMd.match(/<!--\s*(?:AuthorAvatar|Author_Avatar):\s*(.+?)\s*-->/i);
  if (aaMatch) authorAvatar = aaMatch[1].trim();

  const rgMatch = rawMd.match(/<!--\s*(?:ResponsibleGambling|Responsible_Gambling):\s*(.+?)\s*-->/i);
  if (rgMatch) responsibleGambling = rgMatch[1].trim();

  const uhMatch = rawMd.match(/<!--\s*UnlockHeading:\s*(.+?)\s*-->/i);
  if (uhMatch) unlockHeading = uhMatch[1].trim();

  const udMatch = rawMd.match(/<!--\s*UnlockDescription:\s*(.+?)\s*-->/i);
  if (udMatch) unlockDescription = udMatch[1].trim();

  const ltMatch = rawMd.match(/<!--\s*ListTitle:\s*(.+?)\s*-->/i);
  if (ltMatch) listTitle = ltMatch[1].trim();

  const lsMatch = rawMd.match(/<!--\s*ListSubtitle:\s*(.+?)\s*-->/i);
  if (lsMatch) listSubtitle = lsMatch[1].trim();

  // Strip YAML frontmatter & comment frontmatter from body
  let cleanedContent = rawMd.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*/, '').trim();
  cleanedContent = cleanedContent.replace(/<!--\s*(Title|DisplayTitle|PageTitle|Description|Keywords|Link|Type|JackpotId|AuthorName|AuthorTitle|AuthorDescription|AuthorAvatar|ResponsibleGambling|UnlockHeading|UnlockDescription|ListTitle|ListSubtitle):\s*.+?\s*-->/gi, '').trim();

  // Extract RESPONSIBLE_GAMBLING_START ... RESPONSIBLE_GAMBLING_END block if present
  const rgBlockMatch = rawMd.match(/<!--\s*RESPONSIBLE_GAMBLING_START\s*-->([\s\S]*?)<!--\s*RESPONSIBLE_GAMBLING_END\s*-->/i);
  if (rgBlockMatch) {
    const extractedRgBlock = rgBlockMatch[1].trim();
    if (extractedRgBlock) {
      responsibleGambling = extractedRgBlock;
    }
  }
  cleanedContent = cleanedContent.replace(/<!--\s*RESPONSIBLE_GAMBLING_START\s*-->[\s\S]*?<!--\s*RESPONSIBLE_GAMBLING_END\s*-->/gi, '').trim();

  // If title was default fallback, attempt to extract from top `# Heading`
  if (title === 'Soka King | Free Football Predictions & Jackpot Tips') {
    const h1Match = cleanedContent.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1].trim();
  }

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

  // Fallbacks for unlockHeading, unlockDescription, listTitle, and listSubtitle
  if (!unlockHeading) {
    unlockHeading = displayTitle || title;
  }
  if (!unlockDescription) {
    unlockDescription = description;
  }
  if (!listTitle) {
    listTitle = "Today's Free Football Predictions";
  }
  if (!listSubtitle) {
    listSubtitle = "High-probability daily double-chance options and standard single tips verified by Soka King mathematical indexes.";
  }

  return {
    pageKey: keyName,
    title,
    displayTitle: displayTitle || undefined,
    description,
    keywords,
    link,
    type,
    jackpotId,
    fixturesCategory,
    icon,
    badgeColor,
    authorName: authorName || undefined,
    authorTitle: authorTitle || undefined,
    authorDescription: authorDescription || undefined,
    authorAvatar: authorAvatar || undefined,
    responsibleGambling: responsibleGambling || undefined,
    miniIntro: miniIntro || undefined,
    unlockHeading: unlockHeading || undefined,
    unlockDescription: unlockDescription || undefined,
    listTitle: listTitle || undefined,
    listSubtitle: listSubtitle || undefined,
    intro,
    middle,
    meat: meat || cleanedContent,
    faq,
    fullContent: cleanedContent,
  };
}

const parsedMarkdownCache = new Map<string, ParsedMarkdownPage>();

export function getMarkdownContent(pageKey: string): ParsedMarkdownPage {
  const normKey = (pageKey || 'home').toLowerCase().trim();
  const cached = parsedMarkdownCache.get(normKey);
  if (cached) return cached;

  const raw = loadRawMarkdown(pageKey);
  const parsed = parseMarkdownPage(raw, pageKey);
  parsedMarkdownCache.set(normKey, parsed);
  return parsed;
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
 * Returns all parsed markdown pages automatically.
 */
export function getAllMarkdownPages(): { pageKey: string; page: ParsedMarkdownPage }[] {
  const results: { pageKey: string; page: ParsedMarkdownPage }[] = [];
  const processedKeys = new Set<string>();

  // 1. Server physical files in src/content/pages/
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
      if (fs.existsSync(pagesDir)) {
        const filenames = fs.readdirSync(pagesDir);
        for (const file of filenames) {
          if (file.endsWith('.md')) {
            const pKey = file.replace(/\.md$/, '').toLowerCase();
            if (!processedKeys.has(pKey)) {
              processedKeys.add(pKey);
              const page = getMarkdownContent(pKey);
              results.push({ pageKey: pKey, page });
            }
          }
        }
      }
    } catch (e) {}
  }

  // 2. Eager glob from import.meta.glob (if running under Vite/bundler)
  for (const fileKey of Object.keys(pageMarkdownFiles)) {
    const pKey = fileKey.replace(/^\.\/pages\//, '').replace(/\.md$/, '').toLowerCase();
    if (!processedKeys.has(pKey)) {
      processedKeys.add(pKey);
      const page = getMarkdownContent(pKey);
      results.push({ pageKey: pKey, page });
    }
  }

  // 3. Fallback map keys from RAW_MARKDOWN_MAP
  for (const rawKey of Object.keys(RAW_MARKDOWN_MAP)) {
    const pKey = rawKey.toLowerCase();
    if (!processedKeys.has(pKey)) {
      processedKeys.add(pKey);
      const page = getMarkdownContent(rawKey);
      results.push({ pageKey: rawKey, page });
    }
  }

  return results;
}

/**
 * Dynamically constructs URL_TO_PAGE_MAP and PAGE_TO_URL_MAP by combining standard base maps
 * with all detected markdown files and their frontmatter links.
 * Also dynamically discovers competitor category pages and jackpot pages.
 */
export function getDynamicUrlMaps(
  baseUrlToPageMap: Record<string, string>,
  basePageToUrlMap: Record<string, string>
) {
  const urlToPageMap: Record<string, string> = { ...baseUrlToPageMap };
  const pageToUrlMap: Record<string, string> = { ...basePageToUrlMap };
  const dynamicCategoryPages: Record<string, any> = {};
  const dynamicJackpotPages: Record<string, { pageKey: string; jackpotId: string; name: string; link: string; page: ParsedMarkdownPage }> = {};

  const allMd = getAllMarkdownPages();
  for (const { pageKey, page } of allMd) {
    if (page.link) {
      let normLink = page.link.toLowerCase().trim();
      if (normLink.endsWith('/') && normLink !== '/') {
        normLink = normLink.slice(0, -1);
      }
      urlToPageMap[normLink] = pageKey;
      if (!pageToUrlMap[pageKey]) {
        pageToUrlMap[pageKey] = page.link;
      }
    }
    const defaultPath = `/${pageKey}`;
    if (!urlToPageMap[defaultPath]) {
      urlToPageMap[defaultPath] = pageKey;
    }
    if (!pageToUrlMap[pageKey]) {
      pageToUrlMap[pageKey] = defaultPath;
    }

    // 1. Dynamic Competitor / Category Discovery
    const isCompetitorOrCategory = 
      page.type === 'competitor' ||
      page.type === 'category' ||
      pageKey.includes('predict') ||
      pageKey.includes('vista') ||
      pageKey.includes('tips') ||
      pageKey.includes('sure-') ||
      pageKey.startsWith('category-');

    if (isCompetitorOrCategory && page.type !== 'jackpot' && page.type !== 'static') {
      dynamicCategoryPages[pageKey] = {
        id: pageKey,
        name: page.displayTitle || page.title || pageKey,
        label: page.displayTitle || page.title || pageKey,
        countText: 'Tips',
        description: page.description || '',
        icon: page.icon || '⚡',
        badgeColor: page.badgeColor || 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        isDynamicCompetitor: true
      };
    }

    // 2. Dynamic Jackpot Discovery
    if (page.type === 'jackpot' || page.jackpotId) {
      const resolvedJackpotId = page.jackpotId || pageKey;
      dynamicJackpotPages[pageKey] = {
        pageKey,
        jackpotId: resolvedJackpotId,
        name: page.displayTitle || page.title || pageKey,
        link: page.link || `/${pageKey}`,
        page
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



