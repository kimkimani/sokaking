import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

const URL_TO_PAGE_MAP: Record<string, string> = {
  '/': 'home',
  '/football-predictions-today': 'category-today',
  '/football-predictions-yesterday': 'category-yesterday',
  '/football-predictions-tomorrow': 'category-tomorrow',
  '/football-predictions-over-1-5-goals': 'category-over15',
  '/football-predictions-btts-gg': 'category-btts',
  '/football-predictions-1x2-home-win': 'category-homewin',
  '/football-predictions-over-2-5-goals': 'category-over25',
  '/football-predictions-double-chance': 'category-doublechance',
  '/254-sure-tips': '254-sure-tips',
  '/cheerplex-predictions-and-tips-today': 'cheerplex-predictions-and-tips-today',
  '/liobet-predictions-and-tips': 'liobet-predictions-and-tips',
  '/sunpel-free-football-betting-tips-and-soccer-predictions': 'sunpel-free-football-betting-tips',
  '/sunpel-free-football-betting-tips': 'sunpel-free-football-betting-tips',
  '/jackpot-tips': 'jackpot-list',
  '/free-sportpesa-mega-jackpot-predictions-and-analysis': 'sportpesa-mega',
  '/free-sportpesa-midweek-jackpot-predictions-and-analysis': 'sportpesa-midweek',
  '/free-betika-grand-jackpot-predictions-and-analysis': 'betika-grand',
  '/free-betika-midweek-jackpot-predictions-and-analysis': 'betika-midweek',
  '/free-mozzart-grand-jackpot-predictions-and-analysis': 'mozzart-grand',
  '/free-mozzart-super-grand-jackpot-predictions-and-analysis': 'mozzart-super-grand',
  '/free-mozzart-daily-jackpot-predictions-and-analysis': 'mozzart-daily',
  '/free-sportybet-jackpot-predictions-and-analysis': 'sportybet-jackpot',
  '/free-betpawa-pick-jackpot-predictions-and-analysis': 'betpawa-pick-jackpot',
  '/free-odibet-laki-tatu-jackpot-predictions-and-analysis': 'odibet-laki-tatu',
  '/free-mozzart-super-daily-jackpot-predictions-and-analysis': 'mozzart-super-daily',
  '/vip-packages': 'vip-packages',
  '/vip-tips': 'vip-packages',
  '/vip': 'vip-packages',
  '/odds': 'vip-packages',
  '/about-us': 'about',
  '/partners': 'partners',
  '/responsible-gambling': 'responsible-gambling',
  '/privacy-policy': 'privacy-policy',
  '/terms-of-use': 'terms-of-use',
  '/contact-us': 'contact',
  '/database-export': 'database-export',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = '/' + (slug ? slug.join('/') : '');
  const pageId = URL_TO_PAGE_MAP[path] || 'category-today';
  return getPageMetadata(pageId, path);
}

export default async function DynamicCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = '/' + (slug ? slug.join('/') : '');
  const pageId = URL_TO_PAGE_MAP[path] || 'category-today';
  return <SokaPageServer pageId={pageId} customCanonical={path} />;
}
