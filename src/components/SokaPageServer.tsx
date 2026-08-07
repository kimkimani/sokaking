import App from '../App';
import { getMarkdownContent, buildCanonicalUrl } from '../content/markdownLoader';
import { jackpotsData } from '../jackpotsData';
import { generateUnifiedPredictionsPool } from '../utils/predictionGenerator';

interface SokaPageServerProps {
  pageId: string;
  customCanonical?: string;
}

export default async function SokaPageServer({ pageId, customCanonical }: SokaPageServerProps) {
  const pageMd = getMarkdownContent(pageId);
  const fullCanonicalUrl = buildCanonicalUrl(customCanonical || pageMd.link, pageId);

  // Preloaded static data for initial render (fast & non-blocking)
  const preloadedJackpots = jackpotsData;
  const preloadedPredictions = generateUnifiedPredictionsPool();

  // Generate FAQ JSON-LD Schema if page has FAQs
  let faqSchema: any = null;
  if (pageMd.faq) {
    const faqPairs: { question: string; answer: string }[] = [];
    const faqBlocks = pageMd.faq.split(/(?=###|\n(?=###))/g);

    for (const block of faqBlocks) {
      const qMatch = block.match(/###\s+(.+)/);
      if (qMatch) {
        const question = qMatch[1].trim();
        const answer = block.replace(/###\s+.+/, '').replace(/<!--\s*FAQ\s*-->/i, '').trim();
        if (question && answer) {
          faqPairs.push({ question, answer });
        }
      }
    }

    if (faqPairs.length > 0) {
      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqPairs.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          }
        }))
      };
    }
  }

  // WebPage / Article Schema
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageMd.title,
    description: pageMd.description,
    url: fullCanonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Soka King',
      url: 'https://sokaking.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sokaking.com/icon.png'
      }
    }
  };

  return (
    <>
      {/* Schema.org Structured Data Injection for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hidden SEO fallback container for bots that ignore JS hydration */}
      <div className="sr-only opacity-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <h1>{pageMd.title}</h1>
        <p>{pageMd.description}</p>
        <div>{pageMd.intro}</div>
        <div>{pageMd.meat}</div>
        <div>{pageMd.faq}</div>
      </div>

      {/* Interactive Hydrated React Application */}
      <App 
        initialPage={pageId} 
        initialJackpotId={pageId} 
        initialPredictions={preloadedPredictions} 
        initialJackpots={preloadedJackpots} 
      />
    </>
  );
}
