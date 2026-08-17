import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

export interface LanguageOption {
  value: string;
  label: string;
}

const aliases: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'xml',
  xhtml: 'xml',
  md: 'markdown',
  text: 'plaintext',
  txt: 'plaintext',
  plain: 'plaintext',
};

const options: LanguageOption[] = [
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'markdown', label: 'Markdown' },
];

hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('markdown', markdown);

export function normalizeLanguage(language: string | null | undefined): string {
  const candidate = (language ?? '').trim().toLowerCase();
  const normalized = aliases[candidate] ?? candidate;
  return options.some((option) => option.value === normalized) ? normalized : 'plaintext';
}

export function getLanguageOptions(): readonly LanguageOption[] {
  return options;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

export function highlightCode(value: string, language: string): string {
  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage === 'plaintext' || value.length === 0) {
    return escapeHtml(value);
  }

  try {
    return hljs.highlight(value, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  } catch {
    return escapeHtml(value);
  }
}
