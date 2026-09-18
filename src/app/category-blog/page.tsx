import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-blog', '/category-blog');
}

export default function CategoryBlogAppRouterPage() {
  return <SokaPageServer pageId="category-blog" customCanonical="/category-blog" />;
}
