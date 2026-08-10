import { MetadataRoute } from 'next';
import { getAllSitemapRoutes, getMarkdownRoutesSet, isLowerPriorityRoute, BASE_URL } from '../utils/sitemapGenerator';

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = getAllSitemapRoutes();
  const mdRoutes = getMarkdownRoutesSet();
  const currentDate = new Date().toISOString();

  return routes.map((p) => {
    const isMarkdownPage = mdRoutes.has(p);
    const isJackpotOrPred = p.includes('jackpot') || p.includes('prediction') || p.includes('tips') || p.includes('sure') || p === '/';

    let priority = 0.5;
    let changeFrequency: 'daily' | 'weekly' = 'weekly';

    if (p === '/') {
      priority = 1.0;
      changeFrequency = 'daily';
    } else if (isLowerPriorityRoute(p)) {
      priority = 0.64;
      changeFrequency = 'weekly';
    } else if (isMarkdownPage || isJackpotOrPred) {
      priority = 0.8;
      changeFrequency = 'daily';
    }

    return {
      url: p === '/' ? BASE_URL : `${BASE_URL}${p}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
    };
  });
}

