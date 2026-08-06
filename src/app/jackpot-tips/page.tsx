import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('jackpot-list', '/jackpot-tips');
}

export default function JackpotTipsPage() {
  return <SokaPageServer pageId="jackpot-list" customCanonical="/jackpot-tips" />;
}
