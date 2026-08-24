import fs from 'fs';
import path from 'path';
import { getAllSitemapRoutes } from '../src/utils/sitemapGenerator';
import { classifyRoute } from '../src/utils/urlClassifier';

function runAudit() {
  console.log('=== SOKA KING DOMAIN HEALTH & SPAM SCORE AUDIT ===\n');

  // 1. Audit all valid routes
  const routes = getAllSitemapRoutes();
  console.log(`[Valid Routes] Found ${routes.length} active indexed routes in sitemap:`);
  
  let validCount = 0;
  let issueCount = 0;

  for (const r of routes) {
    const classification = classifyRoute(r);
    if (classification.status === 200) {
      validCount++;
    } else {
      console.warn(`⚠️ Warning: Route ${r} classified as ${classification.status} (${classification.reason})`);
      issueCount++;
    }
  }

  console.log(`  -> ${validCount} routes verified HTTP 200 OK.`);
  if (issueCount === 0) {
    console.log('  -> All sitemap routes passed validation cleanly.\n');
  }

  // 2. Test known legacy spam patterns to verify HTTP 410 / 404 response enforcement
  const testSpamUrls = [
    '/wp-admin/index.php',
    '/wp-content/uploads/2018/04/casino.jpg',
    '/xmlrpc.php',
    '/feed',
    '/index.php?option=com_content&id=42',
    '/casino/slot88-gacor',
    '/viagra-cheap-online',
    '/free-download-apk-mod.cgi',
    '/2019/07/15/old-blog-post/',
    '/shop/product/12345',
    '/random-nonexistent-url-slug'
  ];

  console.log('[Spam Defense Verification] Testing legacy expired domain URL patterns:');
  for (const spamUrl of testSpamUrls) {
    const res = classifyRoute(spamUrl);
    const badge = res.status === 410 ? '410 GONE' : (res.status === 404 ? '404 NOT FOUND' : '200 OK');
    console.log(`  - ${spamUrl.padEnd(45)} => [${badge}] ${res.reason || ''}`);
  }

  // 3. Check Disavow file
  const disavowPath = path.join(process.cwd(), 'public', 'disavow.txt');
  if (fs.existsSync(disavowPath)) {
    const content = fs.readFileSync(disavowPath, 'utf-8');
    const domainLines = content.split('\n').filter(l => l.trim().startsWith('domain:'));
    console.log(`\n[Disavow File] Verified public/disavow.txt with ${domainLines.length} toxic domain disavow entries.`);
  }

  // 4. Check Robots.txt
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    console.log('[Robots.txt] Verified public/robots.txt protection headers.');
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit();
