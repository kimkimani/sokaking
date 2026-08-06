import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('cheerplex-predictions-and-tips-today', '/cheerplex-predictions-and-tips-today');
}

export default function CheerplexPage() {
  return <SokaPageServer pageId="cheerplex-predictions-and-tips-today" customCanonical="/cheerplex-predictions-and-tips-today" />;
}
