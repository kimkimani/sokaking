/**
 * Utility to parse structured FAQ items from Markdown text.
 * Expects Markdown containing headers like:
 * ## Frequently Asked Questions
 * ### What is Poisson distribution?
 * Answer text...
 *
 * or with <!-- FAQ --> delimiters.
 */

export interface ParsedFaqItem {
  question: string;
  answer: string;
}

export function parseFaqsFromMarkdown(markdown: string): ParsedFaqItem[] {
  if (!markdown || typeof markdown !== 'string') return [];

  // Locate FAQ section if demarcated
  let faqContent = markdown;
  const delimiterMatch = markdown.match(/(?:<!--\s*FAQ\s*-->|##\s+(?:Frequently Asked Questions|FAQ)[^\r\n]*)[\s\S]*/i);
  if (delimiterMatch) {
    faqContent = delimiterMatch[0];
  }

  const items: ParsedFaqItem[] = [];
  const lines = faqContent.split(/\r?\n/);

  let currentQuestion = '';
  let currentAnswerLines: string[] = [];

  for (const line of lines) {
    // Check for question headings: ### Question or #### Question or **Q: Question**
    const questionMatch = 
      line.match(/^#{3,4}\s+(.+)$/) || 
      line.match(/^\*\*(?:Q:\s*|Question:\s*)([^*]+)\*\*/i) ||
      line.match(/^(?:Q\d*[:.]\s*|\*\*Q\d*[:.]\s*)(.+)/i);

    // If another major H2 appears (not FAQ), stop parsing questions
    if (line.match(/^##\s+/) && !line.match(/faq|frequently asked/i)) {
      if (currentQuestion) {
        items.push({
          question: currentQuestion,
          answer: currentAnswerLines.join('\n').trim()
        });
        currentQuestion = '';
        currentAnswerLines = [];
      }
      break;
    }

    if (questionMatch) {
      if (currentQuestion) {
        items.push({
          question: currentQuestion,
          answer: currentAnswerLines.join('\n').trim()
        });
        currentAnswerLines = [];
      }
      currentQuestion = questionMatch[1].replace(/^(?:q:\s*|question:\s*|\*\*\s*|\s*\*\*)/gi, '').trim();
    } else if (currentQuestion) {
      currentAnswerLines.push(line);
    }
  }

  if (currentQuestion && currentAnswerLines.length > 0) {
    items.push({
      question: currentQuestion,
      answer: currentAnswerLines.join('\n').trim()
    });
  }

  return items;
}
