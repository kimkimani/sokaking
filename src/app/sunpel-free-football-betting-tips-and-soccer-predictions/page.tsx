import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('sunpel-free-football-betting-tips', '/sunpel-free-football-betting-tips-and-soccer-predictions');
}

export default function SunpelLongPage() {
  return <SokaPageServer pageId="sunpel-free-football-betting-tips" customCanonical="/sunpel-free-football-betting-tips-and-soccer-predictions" />;
}
