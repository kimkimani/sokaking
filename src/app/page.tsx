import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('home', '/');
}

export default function HomePage() {
  return <SokaPageServer pageId="home" customCanonical="/" />;
}
