import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('about', '/about-us');
}

export default function AboutPage() {
  return <SokaPageServer pageId="about" customCanonical="/about-us" />;
}
