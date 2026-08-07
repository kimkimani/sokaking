import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../src/utils/sitemapGenerator';

function buildStaticSitemap() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const xml = generateSitemapXml();
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf-8');
    console.log(`[Sitemap Generator] Successfully generated ${sitemapPath}`);

    const robotsContent = `User-agent: *
Allow: /

Sitemap: https://sokaking.com/sitemap.xml
`;
    const robotsPath = path.join(publicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
    console.log(`[Sitemap Generator] Successfully generated ${robotsPath}`);
  } catch (err) {
    console.error('[Sitemap Generator] Error building static sitemap:', err);
  }
}

buildStaticSitemap();
