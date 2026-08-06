import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('privacy-policy', '/privacy-policy');
}

export default function PrivacyPolicyPage() {
  return <SokaPageServer pageId="privacy-policy" customCanonical="/privacy-policy" />;
}
