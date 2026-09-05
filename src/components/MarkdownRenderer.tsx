import React, { useState, useEffect } from 'react';
import { expandTopFixturesParameters, fetchLiveMegaJackpotFixtures, getCachedLiveJackpotFixtures } from '../utils/topJackpotFixtures';
import { Fixture } from '../types';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  postSlug?: string;
  fixtures?: Fixture[];
  jackpotId?: string;
}

/**
 * Resolves a local or relative image URL within a post to the public /blog-assets/[slug]/ URL
 */
function resolveRelativeImageUrl(url: string, postSlug?: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  if (postSlug) {
    const cleanUrl = url.replace(/^\.\//, '');
    return `/blog-assets/${postSlug}/${cleanUrl}`;
  }
  return url;
}

// Parses inline markdown formatting (images: ![alt](url), links: [text](url), bold: **text** or __text__, italic: *text* or _text_, code: `text`)
function parseInline(text: string, postSlug?: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1: ![alt](url) -> match[2] = alt, match[3] = url
  // 2: [text](url) -> match[5] = text, match[6] = url
  // 3: **text** or __text__ -> match[7] or match[8]
  // 4: `code` -> match[9]
  // 5: *text* or _text_ -> match[10] or match[11]
  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      nodes.push(text.slice(lastIndex, matchStart));
    }

    if (match[1] && match[1].startsWith('!')) {
      // Inline Image ![alt](url)
      const altText = match[2] || 'Illustration';
      const rawImgUrl = match[3];
      const imgUrl = resolveRelativeImageUrl(rawImgUrl, postSlug);
      nodes.push(
        <img
          key={`img-${matchStart}`}
          src={imgUrl}
          alt={altText}
          className="inline-block max-w-full h-auto rounded-lg border border-[var(--border)] my-1 align-middle"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    } else if (match[4] && match[5]) {
      // Link [text](url)
      const linkText = match[4];
      const linkUrl = match[5];
      const isExternal = linkUrl.startsWith('http');
      nodes.push(
        <a
          key={`link-${matchStart}`}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-indigo-500 hover:text-indigo-600 underline font-semibold transition-colors"
        >
          {linkText}
        </a>
      );
    } else if (match[6] || match[7]) {
      // Bold **text** or __text__
      nodes.push(
        <strong key={`bold-${matchStart}`} className="font-black text-[var(--text)]">
          {match[6] || match[7]}
        </strong>
      );
    } else if (match[8]) {
      // Inline code `text`
      nodes.push(
        <code key={`code-${matchStart}`} className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)]">
          {match[8]}
        </code>
      );
    } else if (match[9] || match[10]) {
      // Italic *text* or _text_
      nodes.push(
        <em key={`italic-${matchStart}`} className="italic text-[var(--text)]">
          {match[9] || match[10]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export default function MarkdownRenderer({
  content,
  className = '',
  postSlug,
  fixtures,
  jackpotId = 'sportpesa-mega'
}: MarkdownRendererProps) {
  if (!content) return null;

  const [liveDbFixtures, setLiveDbFixtures] = useState<Fixture[] | null>(() => fixtures || getCachedLiveJackpotFixtures());

  useEffect(() => {
    if (fixtures && fixtures.length > 0) {
      setLiveDbFixtures(fixtures);
      return;
    }
    // If not supplied and content contains jackpot fixtures shortcode, fetch directly from DB
    if (/TOP_MEGA_JACKPOT_FIXTURES|TOP_CONFIDENCE_FIXTURES|SPORTPESA_MEGA_TOP_CONFIDENCE/i.test(content)) {
      fetchLiveMegaJackpotFixtures().then(fetched => {
        if (fetched && fetched.length > 0) {
          setLiveDbFixtures(fetched);
        }
      }).catch(() => {});
    }
  }, [fixtures, content]);

  // Expand top jackpot / confidence fixtures parameters using live database fixtures
  const activeFixtures = (fixtures && fixtures.length > 0) ? fixtures : (liveDbFixtures || undefined);
  const expandedContent = expandTopFixturesParameters(content, jackpotId, activeFixtures);

  // 1. Clean out raw markdown marker headings and HTML comments
  const cleanContent = expandedContent
    .replace(/^#{1,4}\s*(INTRO|MIDDLE|MEAT|FAQ|MIDDLE_CONTENT|MEAT_CONTENT|RESPONSIBLE_GAMBLING_START|RESPONSIBLE_GAMBLING_END)\s*$/gim, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (!cleanContent) return null;

  // 2. Parse block elements
  const lines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 0. Top Jackpot Confidence Fixture Line: e.g. "Parma vs Monza — 1", "Everton vs Manchester United — 2 (The game with the hifhest confidence score)"
    const fixtureMatch = trimmed.match(/^(?:###\s+|\*\*)?(.+?\s+vs\s+.+?)\s*[—–-]\s*([0-9X]|DC1X|DC2X|DCX2|DC12|DC2)(?:\s*(\([^)]*(?:highest|hifhest)\s+confidence[^)]*\)))?(?:\*\*)?$/i);
    if (fixtureMatch) {
      const fixtureItems: Array<{
        matchTeams: string;
        matchTip: string;
        isHighest: boolean;
        highestSuffixText: string;
        explanation: string;
      }> = [];

      let curIdx = i;
      while (curIdx < lines.length) {
        const curLine = lines[curIdx].trim();
        if (!curLine) {
          curIdx++;
          continue;
        }

        const match = curLine.match(/^(?:###\s+|\*\*)?(.+?\s+vs\s+.+?)\s*[—–-]\s*([0-9X]|DC1X|DC2X|DCX2|DC12|DC2)(?:\s*(\([^)]*(?:highest|hifhest)\s+confidence[^)]*\)))?(?:\*\*)?$/i);
        if (!match) {
          break;
        }

        const matchTeams = match[1].trim();
        const matchTip = match[2].trim();
        const isHighest = !!match[3];
        const highestSuffixText = match[3] ? match[3].trim() : '(The game with the hifhest confidence score)';

        // Check if next non-empty line is the prediction explanation text
        let explanation = '';
        let nextIdx = curIdx + 1;
        while (nextIdx < lines.length && !lines[nextIdx].trim()) {
          nextIdx++;
        }
        if (nextIdx < lines.length) {
          const candidateLine = lines[nextIdx].trim();
          if (!candidateLine.startsWith('#') && !candidateLine.match(/^(?:###\s+|\*\*)?.+?\s+vs\s+.+?\s*[—–-]/i)) {
            explanation = candidateLine;
            curIdx = nextIdx; // Advance loop to include the explanation
          }
        }

        fixtureItems.push({
          matchTeams,
          matchTip,
          isHighest,
          highestSuffixText,
          explanation
        });

        curIdx++;
      }

      i = curIdx;

      elements.push(
        <div
          key={`fixgroup-${i}`}
          className="my-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)]/80 overflow-hidden divide-y divide-[var(--border)]/40 shadow-2xs"
        >
          {fixtureItems.map((item, idx) => (
            <div
              key={`fix-item-${idx}`}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 transition-colors ${
                item.isHighest
                  ? 'bg-amber-500/[0.08] border-l-2 border-l-amber-500'
                  : 'hover:bg-[var(--accent)]/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[var(--text)]">
                    {item.matchTeams}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs font-semibold shrink-0">—</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                    {item.matchTip}
                  </span>
                </div>
                {item.isHighest && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/35 shrink-0">
                    {item.highestSuffixText}
                  </span>
                )}
              </div>
              {item.explanation && (
                <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-tight mt-0.5 font-normal">
                  {parseInline(item.explanation, postSlug)}
                </p>
              )}
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 1. Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight mb-2 mt-4 uppercase font-display"
        >
          {parseInline(trimmed.substring(2), postSlug)}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight mt-6 mb-2 uppercase font-mono text-[var(--primary)] flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block shrink-0" />
          {parseInline(trimmed.substring(3), postSlug)}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-[var(--text)] mt-4 mb-2"
        >
          {parseInline(trimmed.substring(4), postSlug)}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs sm:text-sm font-extrabold text-[var(--text)] mt-3 mb-1 uppercase font-mono tracking-wider"
        >
          {parseInline(trimmed.substring(5), postSlug)}
        </h4>
      );
      i++;
      continue;
    }

    // 2. Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-[var(--primary)] pl-4 italic bg-[var(--card)] py-2 my-3 rounded-r text-[var(--text-muted)] leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1.5' : ''}>
              {parseInline(ql, postSlug)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 3. Tables (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());
        const isSeparator = /^[\s|:-]+$/.test(tableLines[1]);
        const bodyLines = isSeparator ? tableLines.slice(2) : tableLines.slice(1);

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  {headerCells.map((hc, hIdx) => (
                    <th key={hIdx} className="bg-[var(--card)] p-3 font-bold border-b border-[var(--border)] text-[var(--text)]">
                      {parseInline(hc, postSlug)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyLines.map((row, rIdx) => {
                  const rowCells = row.split('|').slice(1, -1).map(c => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-[var(--card)]/50">
                      {rowCells.map((rc, cIdx) => (
                        <td key={cIdx} className="p-3 border-b border-[var(--border)]">
                          {parseInline(rc, postSlug)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Unordered Lists (* item or - item)
    if (/^(\*|-)\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^(\*|-)\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
          {listItems.map((liText, liIdx) => (
            <li key={liIdx} className="leading-relaxed">
              {parseInline(liText, postSlug)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Ordered Lists (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
          {listItems.map((liText, liIdx) => (
            <li key={liIdx} className="leading-relaxed">
              {parseInline(liText, postSlug)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Block Image: ![alt](url) alone on a line
    const imgBlockMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgBlockMatch) {
      const altText = imgBlockMatch[1] || 'Illustration';
      const rawImgUrl = imgBlockMatch[2];
      const imgUrl = resolveRelativeImageUrl(rawImgUrl, postSlug);
      elements.push(
        <figure key={`img-fig-${i}`} className="my-6 space-y-2">
          <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-slate-900/5 dark:bg-slate-900/40 shadow-xs">
            <img
              src={imgUrl}
              alt={altText}
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          {altText && altText !== 'Illustration' && (
            <figcaption className="text-center text-[11px] font-mono text-[var(--text-muted)] italic">
              {altText}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // 7. Regular Paragraphs
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-2.5">
        {parseInline(trimmed, postSlug)}
      </p>
    );
    i++;
  }

  return (
    <div className={`markdown-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed space-y-3 ${className}`}>
      {elements}
    </div>
  );
}
