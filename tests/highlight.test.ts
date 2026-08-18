import { describe, expect, it } from 'vitest';
import { escapeHtml, highlightCode, highlightCodeForPath, inferLanguageFromPath, normalizeLanguage } from '../src/highlight/registry';

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

  it('infers common repository languages from the basename and extension', () => {
    expect(inferLanguageFromPath('packages/app/src/main.tsx')).toBe('typescript');
    expect(inferLanguageFromPath('third_party/README.md')).toBe('markdown');
    expect(inferLanguageFromPath('cmd/server/main.go')).toBe('go');
    expect(inferLanguageFromPath('src/parser.rs')).toBe('rust');
    expect(inferLanguageFromPath('docs/contributing.adoc')).toBe('asciidoc');
    expect(inferLanguageFromPath('unknown.data')).toBe('plaintext');
  });

  it('lets a caller override inference while keeping unknown paths escaped', () => {
    expect(highlightCodeForPath('const value = 1;', 'notes.unknown', 'typescript')).toContain('hljs-');
    const output = highlightCodeForPath('<img src=x onerror=alert(1)>', 'notes.unknown');
    expect(output).toBe(escapeHtml('<img src=x onerror=alert(1)>'));
    expect(output).not.toContain('<img');
  });

  it('infers each file independently in a mixed-language patch', () => {
    const files = [
      ['index.html', '<button>Save</button>'],
      ['styles.css', '.button { color: red; }'],
      ['src/main.ts', 'const count: number = 1;'],
      ['src/boot.js', 'export function boot() {}'],
    ] as const;

    expect(files.map(([path]) => inferLanguageFromPath(path))).toEqual([
      'xml',
      'css',
      'typescript',
      'javascript',
    ]);

    const outputs = files.map(([path, code]) => highlightCodeForPath(code, path));
    expect(outputs.every((output) => output.includes('hljs-'))).toBe(true);
  });
});
