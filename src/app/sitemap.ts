import { MetadataRoute } from 'next';
import { getAllSitemapRoutes, BASE_URL } from '../utils/sitemapGenerator';

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = getAllSitemapRoutes();
  const currentDate = new Date().toISOString();

  return routes.map((p) => {
    const isJackpotOrPred = p.includes('jackpot') || p.includes('prediction') || p.includes('tips') || p === '/';
    return {
      url: p === '/' ? BASE_URL : `${BASE_URL}${p}`,
      lastModified: currentDate,
      changeFrequency: isJackpotOrPred ? 'daily' : 'weekly',
      priority: p === '/' ? 1.0 : isJackpotOrPred ? 0.8 : 0.5,
    };
  });
}

