import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Parses inline markdown formatting (bold, italic, links, inline code)
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match links: [text](url), bold: **text** or __text__, italic: *text* or _text_, code: `text`
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      nodes.push(text.slice(lastIndex, matchStart));
    }

    if (match[2] && match[3]) {
      // Link [text](url)
      const linkText = match[2];
      const linkUrl = match[3];
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
    } else if (match[4] || match[5]) {
      // Bold **text** or __text__
      nodes.push(
        <strong key={`bold-${matchStart}`} className="font-black text-[var(--text)]">
          {match[4] || match[5]}
        </strong>
      );
    } else if (match[6]) {
      // Inline code `text`
      nodes.push(
        <code key={`code-${matchStart}`} className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)]">
          {match[6]}
        </code>
      );
    } else if (match[7] || match[8]) {
      // Italic *text* or _text_
      nodes.push(
        <em key={`italic-${matchStart}`} className="italic text-[var(--text)]">
          {match[7] || match[8]}
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

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // 1. Clean out raw markdown marker headings and HTML comments
  const cleanContent = content
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

    // 1. Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight mb-2 mt-4 uppercase font-display"
        >
          {parseInline(trimmed.substring(2))}
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
          {parseInline(trimmed.substring(3))}
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
          {parseInline(trimmed.substring(4))}
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
          {parseInline(trimmed.substring(5))}
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
              {parseInline(ql)}
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
                      {parseInline(hc)}
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
                          {parseInline(rc)}
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
              {parseInline(liText)}
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
              {parseInline(liText)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Regular Paragraphs
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-2.5">
        {parseInline(trimmed)}
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
