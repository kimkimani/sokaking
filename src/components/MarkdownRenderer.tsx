import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Clean out any raw markdown marker headings like "## MIDDLE", "## MEAT", "## INTRO", "## FAQ"
  const cleanContent = content
    .replace(/^#{1,4}\s*(INTRO|MIDDLE|MEAT|FAQ|MIDDLE_CONTENT|MEAT_CONTENT)\s*$/gim, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (!cleanContent) return null;

  return (
    <div className={`markdown-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed space-y-3 ${className}`}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight mb-2 uppercase font-display">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight mt-6 mb-2 uppercase font-mono text-[var(--primary)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block shrink-0" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-[var(--text)] mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text)] mt-3 mb-1 uppercase font-mono tracking-wider">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-2.5">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-black text-[var(--text)]">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[var(--primary)] pl-4 italic bg-[var(--card)] py-2 my-3 rounded-r text-[var(--text-muted)]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[var(--card)] p-3 font-bold border-b border-[var(--border)] text-[var(--text)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 border-b border-[var(--border)]">{children}</td>
          ),
        }}
      >
        {cleanContent}
      </Markdown>
    </div>
  );
}
