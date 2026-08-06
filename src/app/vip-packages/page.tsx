import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('vip-packages', '/vip-packages');
}

export default function VipPackagesPage() {
  return <SokaPageServer pageId="vip-packages" customCanonical="/vip-packages" />;
}
