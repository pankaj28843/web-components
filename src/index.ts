import { DiffViewerElement } from './components/diff-viewer';
import { defineWebComponent, registerComponents } from './platform/register';

export { DiffViewerElement } from './components/diff-viewer';
export { createDiff, parseUnifiedDiff } from './diff/model';
export type {
  DiffFile,
  DiffFileStatus,
  DiffDocument,
  DiffHunk,
  DiffLine,
  DiffLineKind,
  DiffRow,
  DiffRowKind,
  DiffStats,
  WordSegment,
} from './diff/model';
export {
  escapeHtml,
  getLanguageOptions,
  highlightCode,
  highlightCodeForPath,
  inferLanguageFromPath,
  normalizeLanguage,
} from './highlight/registry';
export { BaseElement } from './platform/base-element';
export { defineWebComponent, registerComponents } from './platform/register';

export function registerDefaultComponents(): void {
  if (typeof customElements === 'undefined') {
    return;
  }

  registerComponents({ 'wc-diff-viewer': DiffViewerElement });
}

if (typeof customElements !== 'undefined') {
  defineWebComponent('wc-diff-viewer', DiffViewerElement);
}
