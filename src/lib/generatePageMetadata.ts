import { Metadata } from 'next';
import { getMarkdownContent } from '@/src/content/markdownLoader';

export function getPageMetadata(pageId: string, customCanonical?: string): Metadata {
  const md = getMarkdownContent(pageId);
  const canonicalPath = customCanonical || md.link || '/';
  const fullUrl = `https://sokaking.com${canonicalPath}`;

  return {
    title: md.title,
    description: md.description,
    keywords: md.keywords,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: md.title,
      description: md.description,
      url: fullUrl,
      siteName: 'Soka King',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: md.title,
      description: md.description,
    },
  };
}
