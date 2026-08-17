import { describe, expect, it } from 'vitest';
import { escapeHtml, highlightCode, normalizeLanguage } from '../src/highlight/registry';

describe('highlight registry', () => {
  it('normalizes the explicit language set and aliases', () => {
    expect(normalizeLanguage('TS')).toBe('typescript');
    expect(normalizeLanguage('html')).toBe('xml');
    expect(normalizeLanguage('not-a-language')).toBe('plaintext');
  });

  it('keeps plaintext adversarial input inert', () => {
    const input = '<img src=x onerror=alert(1)><script>alert(1)</script>';

    expect(highlightCode(input, 'plaintext')).toBe(escapeHtml(input));
    expect(highlightCode(input, 'plaintext')).not.toContain('<script>');
    expect(highlightCode(input, 'plaintext')).not.toContain('<img');
  });

  it('returns syntax markup only through the controlled highlighter', () => {
    const output = highlightCode('const answer: number = 42;', 'typescript');

    expect(output).toContain('hljs-');
    expect(output).not.toContain('<script');
  });
});
