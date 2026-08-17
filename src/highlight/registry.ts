import hljs from 'highlight.js/lib/core';
import asciidoc from 'highlight.js/lib/languages/asciidoc';
import c from 'highlight.js/lib/languages/c';
import cmake from 'highlight.js/lib/languages/cmake';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import protobuf from 'highlight.js/lib/languages/protobuf';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import vim from 'highlight.js/lib/languages/vim';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

export interface LanguageOption {
  value: string;
  label: string;
}

const aliases: Record<string, string> = {
  auto: 'auto',
  asciidoc: 'asciidoc',
  bash: 'shell',
  cxx: 'cpp',
  docker: 'shell',
  dockerfile: 'shell',
  h: 'c',
  hpp: 'cpp',
  js: 'javascript',
  jsx: 'javascript',
  kt: 'kotlin',
  mk: 'makefile',
  objectivec: 'c',
  objc: 'c',
  protobuf: 'protobuf',
  proto: 'protobuf',
  py: 'python',
  rs: 'rust',
  sh: 'shell',
  shellscript: 'shell',
  text: 'plaintext',
  ts: 'typescript',
  tsx: 'typescript',
  vimscript: 'vim',
  html: 'xml',
  xhtml: 'xml',
  md: 'markdown',
  txt: 'plaintext',
  plain: 'plaintext',
  yml: 'yaml',
};

const options: LanguageOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'asciidoc', label: 'AsciiDoc' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'python', label: 'Python' },
  { value: 'shell', label: 'Shell' },
  { value: 'yaml', label: 'YAML' },
  { value: 'java', label: 'Java' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'lua', label: 'Lua' },
  { value: 'vim', label: 'Vim script' },
  { value: 'protobuf', label: 'Protocol Buffers' },
  { value: 'cmake', label: 'CMake' },
  { value: 'makefile', label: 'Makefile' },
  { value: 'ini', label: 'INI' },
  { value: 'sql', label: 'SQL' },
];

hljs.registerLanguage('c', c);
hljs.registerLanguage('asciidoc', asciidoc);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('cmake', cmake);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('protobuf', protobuf);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('vim', vim);
hljs.registerLanguage('yaml', yaml);

const pathLanguageRules: ReadonlyArray<readonly [RegExp, string]> = [
  [/^dockerfile(?:\..*)?$/i, 'shell'],
  [/^(?:makefile|gnumakefile)$/i, 'makefile'],
  [/^cmakelists\.txt$/i, 'cmake'],
  [/^\.?(?:bash|zsh|fish|profile|shellcheckrc)$/i, 'shell'],
  [/^\.env(?:\..*)?$/i, 'ini'],
  [/\.(?:c|h)$/i, 'c'],
  [/\.(?:cc|cpp|cxx|hh|hpp|hxx|ixx)$/i, 'cpp'],
  [/\.(?:m|mm)$/i, 'c'],
  [/\.(?:js|mjs|cjs|jsx)$/i, 'javascript'],
  [/\.(?:ts|mts|cts|tsx)$/i, 'typescript'],
  [/\.(?:json|jsonc|json5)$/i, 'json'],
  [/\.(?:css|scss|sass|less)$/i, 'css'],
  [/\.(?:html?|xhtml|svg)$/i, 'xml'],
  [/\.(?:md|markdown|mdx)$/i, 'markdown'],
  [/\.(?:adoc|asciidoc|asciidoctor)$/i, 'asciidoc'],
  [/\.(?:go)$/i, 'go'],
  [/\.(?:rs)$/i, 'rust'],
  [/\.(?:py|pyw|pyi)$/i, 'python'],
  [/\.(?:sh|bash|zsh|fish)$/i, 'shell'],
  [/\.(?:ya?ml)$/i, 'yaml'],
  [/\.(?:java)$/i, 'java'],
  [/\.(?:kt|kts)$/i, 'kotlin'],
  [/\.(?:dart)$/i, 'dart'],
  [/\.(?:lua)$/i, 'lua'],
  [/\.(?:vim)$/i, 'vim'],
  [/\.(?:proto)$/i, 'protobuf'],
  [/\.(?:cmake)$/i, 'cmake'],
  [/\.(?:mk|mak)$/i, 'makefile'],
  [/\.(?:ini|cfg|conf|properties)$/i, 'ini'],
  [/\.(?:sql)$/i, 'sql'],
];

export function normalizeLanguage(language: string | null | undefined): string {
  const candidate = (language ?? '').trim().toLowerCase();
  const normalized = aliases[candidate] ?? candidate;
  return options.some((option) => option.value === normalized) ? normalized : 'plaintext';
}

export function inferLanguageFromPath(path: string | null | undefined): string {
  const normalizedPath = ((path ?? '').split(/[?#]/, 1)[0] ?? '').replaceAll('\\', '/');
  const basename = normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1);

  for (const [pattern, language] of pathLanguageRules) {
    if (pattern.test(basename)) {
      return language;
    }
  }

  return 'plaintext';
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

export function highlightCodeForPath(
  value: string,
  path: string | null | undefined,
  languageOverride?: string | null,
): string {
  const requestedLanguage = (languageOverride ?? '').trim();
  const language = requestedLanguage && requestedLanguage.toLowerCase() !== 'auto'
    ? normalizeLanguage(requestedLanguage)
    : inferLanguageFromPath(path);

  return highlightCode(value, language);
}
