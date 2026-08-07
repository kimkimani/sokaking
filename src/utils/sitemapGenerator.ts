import fs from 'fs';
import path from 'path';
import { getAllMarkdownPages } from '../content/markdownLoader';

export const BASE_URL = 'https://sokaking.com';

export function getAllSitemapRoutes(): string[] {
  const defaultRoutes = [
    '/',
    '/football-predictions-today',
    '/football-predictions-yesterday',
    '/football-predictions-tomorrow',
    '/football-predictions-over-1-5-goals',
    '/football-predictions-btts-gg',
    '/football-predictions-1x2-home-win',
    '/football-predictions-over-2-5-goals',
    '/football-predictions-double-chance',
    '/254-sure-tips',
    '/cheerplex-predictions-and-tips-today',
    '/liobet-predictions-and-tips',
    '/sunpel-free-football-betting-tips-and-soccer-predictions',
    '/jackpot-tips',
    '/free-sportpesa-mega-jackpot-predictions-and-analysis',
    '/free-betika-midweek-jackpot-predictions-and-analysis',
    '/free-mozzart-grand-jackpot-predictions-and-analysis',
    '/free-mozzart-super-daily-jackpot-predictions-and-analysis',
    '/free-sportpesa-midweek-jackpot-predictions-and-analysis',
    '/free-sportybet-jackpot-predictions-and-analysis',
    '/free-betpawa-pick-jackpot-predictions-and-analysis',
    '/free-odibet-laki-tatu-jackpot-predictions-and-analysis',
    '/vip-packages',
    '/about-us',
    '/partners',
    '/responsible-gambling',
    '/privacy-policy',
    '/terms-of-use',
    '/contact-us',
  ];

  const routesSet = new Set<string>(defaultRoutes);

  // 1. Scan markdownLoader (includes markdownData.ts and parsed pages)
  try {
    const allMd = getAllMarkdownPages();
    for (const { pageKey, page } of allMd) {
      if (page.link) {
        let normLink = page.link.toLowerCase().trim();
        if (!normLink.startsWith('/')) normLink = '/' + normLink;
        if (normLink.endsWith('/') && normLink !== '/') normLink = normLink.slice(0, -1);
        routesSet.add(normLink);
      } else {
        routesSet.add(`/${pageKey}`);
      }
    }
  } catch (err) {
    console.error('Error getting markdown pages for sitemap:', err);
  }

  // 2. Automatically scan all physical markdown files in src/content/pages/
  try {
    const pagesDir = path.join(process.cwd(), 'src/content/pages');
    if (fs.existsSync(pagesDir)) {
      const files = fs.readdirSync(pagesDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
          const linkMatch = content.match(/^(?:link|Link):\s*"?(.*?)"?$/m);
          if (linkMatch && linkMatch[1]) {
            let normLink = linkMatch[1].trim();
            if (!normLink.startsWith('/')) normLink = '/' + normLink;
            if (normLink.endsWith('/') && normLink !== '/') normLink = normLink.slice(0, -1);
            routesSet.add(normLink);
          } else {
            const pageSlug = file.replace(/\.md$/, '');
            routesSet.add(`/${pageSlug}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading markdown directory for sitemap:', err);
  }

  return Array.from(routesSet);
}

export function generateSitemapXml(): string {
  const routes = getAllSitemapRoutes();
  const currentDate = new Date().toISOString();

  const urlEntries = routes.map((p) => {
    const fullUrl = p === '/' ? BASE_URL : `${BASE_URL}${p}`;
    const isJackpotOrPred = p.includes('jackpot') || p.includes('prediction') || p.includes('tips') || p === '/';
    const changeFreq = isJackpotOrPred ? 'daily' : 'weekly';
    const priority = p === '/' ? '1.0' : isJackpotOrPred ? '0.8' : '0.5';

    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
