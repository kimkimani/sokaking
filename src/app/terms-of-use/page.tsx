import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('terms-of-use', '/terms-of-use');
}

export default function TermsOfUsePage() {
  return <SokaPageServer pageId="terms-of-use" customCanonical="/terms-of-use" />;
}
