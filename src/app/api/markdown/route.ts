import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || 'home';
    const type = searchParams.get('type') || 'page';
    let normKey = key.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
    if (!normKey) normKey = 'home';

    if (type === 'author' || normKey.startsWith('author-')) {
      normKey = normKey.replace(/^author-/, '');
      const authorsDir = path.join(process.cwd(), 'src', 'content', 'authors');
      let filePath = path.join(authorsDir, `${normKey}.md`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return new NextResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }
    }

    if (normKey === 'today' || normKey === 'football-predictions-today') normKey = 'category-today';
    if (normKey === 'tomorrow' || normKey === 'football-predictions-tomorrow') normKey = 'category-tomorrow';
    if (normKey === 'yesterday' || normKey === 'football-predictions-yesterday') normKey = 'category-yesterday';
    if (normKey === 'over15' || normKey === 'over-1-5' || normKey === 'football-predictions-over-1-5-goals') normKey = 'category-over15';
    if (normKey === 'over25' || normKey === 'over-2-5' || normKey === 'football-predictions-over-2-5-goals') normKey = 'category-over25';
    if (normKey === 'btts' || normKey === 'gg' || normKey === 'football-predictions-btts-gg') normKey = 'category-btts';
    if (normKey === 'doublechance' || normKey === 'double-chance' || normKey === 'football-predictions-double-chance') normKey = 'category-doublechance';
    if (normKey === 'homewin' || normKey === 'home-win' || normKey === '1x2' || normKey === 'football-predictions-1x2-home-win') normKey = 'category-homewin';
    if (normKey === 'about-us') normKey = 'about';
    if (normKey === 'contact-us') normKey = 'contact';
    if (normKey === 'privacy') normKey = 'privacy-policy';
    if (normKey === 'terms') normKey = 'terms-of-use';
    if (normKey === 'vip' || normKey === 'vip-tips' || normKey === 'odds') normKey = 'vip-packages';
    if (normKey === 'jackpot-tips') normKey = 'jackpot-list';

    const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
    let filePath = path.join(pagesDir, `${normKey}.md`);

    if (!fs.existsSync(filePath) && fs.existsSync(pagesDir)) {
      const filenames = fs.readdirSync(pagesDir);
      const match = filenames.find(f => f.toLowerCase() === `${normKey}.md` || f.toLowerCase() === normKey);
      if (match) {
        filePath = path.join(pagesDir, match);
      }
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    return NextResponse.json({ error: 'Markdown file not found', key: normKey }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
