import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';
import { getMarkdownContent, getAllMarkdownPages } from '@/src/content/markdownLoader';
import { URL_TO_PAGE_MAP, PAGE_TO_URL_MAP } from '@/src/utils/navigation';

function resolvePageId(path: string): { pageId: string; canonicalPath: string } {
  let normPath = path.toLowerCase().trim();
  if (normPath.endsWith('/') && normPath !== '/') {
    normPath = normPath.slice(0, -1);
  }

  if (URL_TO_PAGE_MAP[normPath]) {
    const pId = URL_TO_PAGE_MAP[normPath];
    const canonicalPath = PAGE_TO_URL_MAP[pId] || normPath;
    return { pageId: pId, canonicalPath };
  }

  const rawSlug = normPath.replace(/^\//, '');
  if (rawSlug) {
    if (URL_TO_PAGE_MAP[`/${rawSlug}`]) {
      const pId = URL_TO_PAGE_MAP[`/${rawSlug}`];
      return { pageId: pId, canonicalPath: PAGE_TO_URL_MAP[pId] || normPath };
    }
    // Check if rawSlug directly loads valid markdown
    const md = getMarkdownContent(rawSlug);
    if (md && md.title && md.title !== 'Soka King | Free Football Predictions & Jackpot Tips') {
      return { pageId: rawSlug, canonicalPath: md.link || normPath };
    }
  }

  return { pageId: 'category-today', canonicalPath: '/football-predictions-today' };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = '/' + (slug ? slug.join('/') : '');
  const { pageId, canonicalPath } = resolvePageId(path);
  return getPageMetadata(pageId, canonicalPath);
}

export async function generateStaticParams() {
  const allPages = getAllMarkdownPages();
  const slugSet = new Set<string>();

  for (const { pageKey, page } of allPages) {
    if (pageKey === 'home') continue;

    // Standard slug from pageKey
    if (pageKey) slugSet.add(pageKey.toLowerCase());

    // Frontmatter link slug if present
    if (page.link) {
      const cleanLink = page.link.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
      if (cleanLink) slugSet.add(cleanLink);
    }
  }

  return Array.from(slugSet).map((slugStr) => ({
    slug: slugStr.split('/'),
  }));
}

export default async function DynamicCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = '/' + (slug ? slug.join('/') : '');
  const { pageId, canonicalPath } = resolvePageId(path);
  return <SokaPageServer pageId={pageId} customCanonical={canonicalPath} />;
}
