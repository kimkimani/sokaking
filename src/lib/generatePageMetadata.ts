import { Metadata } from 'next';
import { getMarkdownContent, buildCanonicalUrl } from '@/src/content/markdownLoader';

export function getPageMetadata(pageId: string, customCanonical?: string): Metadata {
  const md = getMarkdownContent(pageId);
  const fullUrl = buildCanonicalUrl(customCanonical || md.link, pageId);

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
