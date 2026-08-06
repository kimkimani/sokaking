import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('contact', '/contact-us');
}

export default function ContactUsPage() {
  return <SokaPageServer pageId="contact" customCanonical="/contact-us" />;
}
