import App from '../App';
import { getMarkdownContent, buildCanonicalUrl } from '../content/markdownLoader';
import { jackpotsData } from '../jackpotsData';
import { generatePageJsonLd } from '../utils/schemaGenerator';

interface SokaPageServerProps {
  pageId: string;
  customCanonical?: string;
}

export default async function SokaPageServer({ pageId, customCanonical }: SokaPageServerProps) {
  const pageMd = getMarkdownContent(pageId);
  const fullCanonicalUrl = buildCanonicalUrl(customCanonical || pageMd.link, pageId);

  // Preloaded static data for initial render (fast & non-blocking)
  const preloadedJackpots = jackpotsData;
  const preloadedPredictions: any[] = [];

  // Generate complete Schema.org JSON-LD graph tailored for page type
  const { fullGraph } = generatePageJsonLd(pageId);

  return (
    <>
      {/* Schema.org Structured Data Injection for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fullGraph) }}
      />

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
