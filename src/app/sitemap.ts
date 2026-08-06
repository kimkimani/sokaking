import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sokaking.com';
  
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
    '/vip-packages',
    '/about-us',
    '/partners',
    '/responsible-gambling',
    '/privacy-policy',
    '/terms-of-use',
    '/contact-us',
  ];

  const routesSet = new Set<string>(defaultRoutes);

  // Automatically scan all markdown files in src/content/pages/
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

  const currentDate = new Date().toISOString();

  return Array.from(routesSet).map((p) => {
    const isJackpotOrPred = p.includes('jackpot') || p.includes('prediction') || p.includes('tips') || p === '/';
    return {
      url: p === '/' ? baseUrl : `${baseUrl}${p}`,
      lastModified: currentDate,
      changeFrequency: isJackpotOrPred ? 'daily' : 'weekly',
      priority: p === '/' ? 1.0 : isJackpotOrPred ? 0.8 : 0.5,
    };
  });
}
