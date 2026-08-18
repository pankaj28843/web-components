import type { DiffDocument } from '../diff/model';
import { createDiff, parseUnifiedDiff } from '../diff/model';
import { getLanguageOptions, normalizeLanguage } from '../highlight/registry';
import { BaseElement } from '../platform/base-element';
import { diffViewerStyles } from './diff-viewer-styles';
import { renderDiffBody, type ViewMode } from './diff-viewer-view';

function isViewMode(value: string | null | undefined): value is ViewMode {
  return value === 'unified' || value === 'split';
}

export class DiffViewerElement extends BaseElement {
  private _oldText = '';
  private _newText = '';
  private _diffText: string | null = null;
  private _language = 'auto';
  private _view: ViewMode = 'unified';
  private _wrap = false;
  private _query = '';
  private _matchIndex = 0;
  private readonly _collapsedFiles = new Set<string>();

  public constructor() {
    super();
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('change', this.handleChange);
    this.root.addEventListener('input', this.handleInput);
    this.root.addEventListener('keydown', this.handleKeydown);
  }

  public static get observedAttributes(): string[] {
    return ['language', 'view', 'wrap', 'title', 'old-label', 'new-label', 'path'];
  }

  public get oldText(): string {
    return this._oldText;
  }

  public set oldText(value: string) {
    this._oldText = value;
    this._diffText = null;
    this._collapsedFiles.clear();
    this.requestRender();
  }

  public get newText(): string {
    return this._newText;
  }

  public set newText(value: string) {
    this._newText = value;
    this._diffText = null;
    this._collapsedFiles.clear();
    this.requestRender();
  }

  public get diffText(): string {
    return this._diffText ?? '';
  }

  public set diffText(value: string) {
    this._diffText = value;
    this._collapsedFiles.clear();
    this.requestRender();
  }

  public get language(): string {
    return this._language;
  }

  public set language(value: string) {
    const normalized = normalizeLanguage(value);
    this._language = normalized;
    if (this.getAttribute('language') !== normalized) {
      this.setAttribute('language', normalized);
    } else {
      this.requestRender();
    }
  }

  public get view(): ViewMode {
    return this._view;
  }

  public set view(value: ViewMode) {
    const normalized = isViewMode(value) ? value : 'unified';
    this._view = normalized;
    if (this.getAttribute('view') !== normalized) {
      this.setAttribute('view', normalized);
    } else {
      this.requestRender();
    }
  }

  public get wrap(): boolean {
    return this._wrap;
  }

  public set wrap(value: boolean) {
    this._wrap = value;
    if (value) {
      if (!this.hasAttribute('wrap')) {
        this.setAttribute('wrap', '');
      }
    } else if (this.hasAttribute('wrap')) {
      this.removeAttribute('wrap');
    } else {
      this.requestRender();
    }
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === 'language') {
      this._language = normalizeLanguage(newValue);
    } else if (name === 'view') {
      this._view = isViewMode(newValue) ? newValue : 'unified';
    } else if (name === 'wrap') {
      this._wrap = newValue !== null && newValue !== 'false';
    }
    this.requestRender();
  }

  protected render(): void {
    const diff = this.getDiffDocument();
    this.root.innerHTML = `<style>${diffViewerStyles}</style>
      <section class="shell" aria-labelledby="diff-viewer-title">
        <header class="heading">
          <div class="heading-copy">
            <p class="eyebrow">Changed files</p>
            <h2 id="diff-viewer-title" data-role="title"></h2>
            <p class="subtitle">Review a standard unified patch with file metadata, hunk provenance, syntax-aware code, and keyboard-friendly navigation.</p>
          </div>
          <span class="source-badge" data-role="source"></span>
        </header>
        <div class="toolbar" role="toolbar" aria-label="Diff controls">
          <div class="control-group" role="group" aria-label="Diff view">
            <button type="button" data-action="view" data-value="unified" aria-pressed="false">Unified</button>
            <button type="button" data-action="view" data-value="split" aria-pressed="false">Split</button>
          </div>
          <label class="field">
            <span>Language</span>
            <select data-field="language" aria-label="Syntax language"></select>
          </label>
          <label class="field">
            <input type="checkbox" data-field="wrap" aria-label="Wrap lines" />
            <span>Wrap lines</span>
          </label>
          <label class="field search-field">
            <span>Find</span>
            <input type="search" data-field="search" placeholder="Search changed text" autocomplete="off" spellcheck="false" aria-label="Search changed text" />
            <span class="search-status" data-role="search-status" aria-live="polite"></span>
          </label>
          <button type="button" data-action="previous" aria-label="Previous search match">↑</button>
          <button type="button" data-action="next" aria-label="Next search match">↓</button>
          <button type="button" data-action="copy">Copy new side</button>
        </div>
        <div class="summary" aria-label="Diff statistics">
          <span class="stat" data-stat="files"></span>
          <span class="stat" data-stat="hunks"></span>
          <span class="stat" data-stat="added"></span>
          <span class="stat" data-stat="removed"></span>
          <span class="line-summary" data-role="line-summary"></span>
        </div>
        <div class="body" data-role="body"></div>
        <p class="status" data-role="status" aria-live="polite"></p>
      </section>`;

    const title = this.getAttribute('title')?.trim() || 'Diff review';
    const oldLabel = this.getAttribute('old-label')?.trim() || 'Base';
    const newLabel = this.getAttribute('new-label')?.trim() || 'Changed';
    this.setText('[data-role="title"]', title);
    this.setText('[data-role="source"]', diff.source === 'unified' ? 'GIT UNIFIED DIFF' : 'TEXT COMPARISON');
    this.setText('[data-stat="files"]', `${diff.stats.files} ${diff.stats.files === 1 ? 'file' : 'files'}`);
    this.setText('[data-stat="hunks"]', `${diff.stats.hunks} ${diff.stats.hunks === 1 ? 'hunk' : 'hunks'}`);
    this.setText('[data-stat="added"]', `+${diff.stats.added}`);
    this.setText('[data-stat="removed"]', `−${diff.stats.removed}`);
    this.setText('[data-role="line-summary"]', `${oldLabel}: ${diff.stats.oldLines} lines · ${newLabel}: ${diff.stats.newLines} lines`);

    const languageSelect = this.root.querySelector<HTMLSelectElement>('[data-field="language"]');
    if (languageSelect) {
      for (const option of getLanguageOptions()) {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        languageSelect.append(element);
      }
      languageSelect.value = this._language;
    }

    const wrapInput = this.root.querySelector<HTMLInputElement>('[data-field="wrap"]');
    if (wrapInput) {
      wrapInput.checked = this._wrap;
    }

    const searchInput = this.root.querySelector<HTMLInputElement>('[data-field="search"]');
    if (searchInput) {
      searchInput.value = this._query;
    }

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="view"]')) {
      button.setAttribute('aria-pressed', String(button.dataset.value === this._view));
    }

    const body = this.root.querySelector<HTMLElement>('[data-role="body"]');
    if (body) {
      const result = renderDiffBody(body, diff, {
        view: this._view,
        wrap: this._wrap,
        language: this._language,
        oldLabel,
        newLabel,
        collapsedFiles: this._collapsedFiles,
      });
      this.setText('[data-role="status"]', this.statusText(diff, result.renderedLines));
    }
    this.applySearch(false);
  }

  private getDiffDocument(): DiffDocument {
    if (this._diffText !== null) {
      return parseUnifiedDiff(this._diffText);
    }
    return createDiff(this._oldText, this._newText);
  }

  private statusText(diff: DiffDocument, renderedLines: number): string {
    if (diff.error) {
      return 'Fix the patch format or provide oldText and newText instead.';
    }
    if (diff.files.length === 0) {
      return 'The inputs are identical or empty.';
    }
    const warningText = diff.warnings.length > 0 ? ` · ${diff.warnings.length} parser warning${diff.warnings.length === 1 ? '' : 's'}` : '';
    return `${renderedLines} patch lines rendered${warningText}.`;
  }

  private setText(selector: string, value: string): void {
    const element = this.root.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  private handleClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const control = target.closest<HTMLElement>('[data-action]');
    const action = control?.dataset.action;
    if (!action) {
      return;
    }

    if (action === 'view') {
      const value = control.dataset.value;
      if (isViewMode(value)) {
        this.view = value;
      }
    } else if (action === 'previous') {
      this.moveMatch(-1, true);
    } else if (action === 'next') {
      this.moveMatch(1, true);
    } else if (action === 'copy') {
      void this.copyNewText();
    } else if (action === 'toggle-file') {
      const fileId = control.dataset.fileId;
      if (fileId) {
        if (this._collapsedFiles.has(fileId)) {
          this._collapsedFiles.delete(fileId);
        } else {
          this._collapsedFiles.add(fileId);
        }
        this.requestRender();
      }
    } else if (action === 'jump-file') {
      const fileId = control.dataset.fileId;
      if (fileId) {
        const file = this.root.querySelector<HTMLElement>(`#${CSS.escape(fileId)}`);
        file?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        file?.querySelector<HTMLElement>('.file-toggle')?.focus({ preventScroll: true });
      }
    }
  };

  private handleChange = (event: Event): void => {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.dataset.field === 'language') {
      this.language = target.value;
    } else if (target instanceof HTMLInputElement && target.dataset.field === 'wrap') {
      this.wrap = target.checked;
    }
  };

  private handleInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.dataset.field !== 'search') {
      return;
    }
    this._query = target.value;
    this._matchIndex = 0;
    if (this._query && this._collapsedFiles.size > 0) {
      this._collapsedFiles.clear();
      this.requestRender();
      return;
    }
    this.applySearch(false);
  };

  private handleKeydown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    const target = keyboardEvent.target;
    if (target instanceof HTMLInputElement && target.dataset.field === 'search' && keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      this.moveMatch(keyboardEvent.shiftKey ? -1 : 1, true);
      return;
    }

    if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'f') {
      keyboardEvent.preventDefault();
      this.root.querySelector<HTMLInputElement>('[data-field="search"]')?.focus();
    } else if (keyboardEvent.key === 'Escape' && this._query.length > 0) {
      this._query = '';
      this._matchIndex = 0;
      const input = this.root.querySelector<HTMLInputElement>('[data-field="search"]');
      if (input) {
        input.value = '';
      }
      this.applySearch(false);
    }
  };

  private moveMatch(direction: -1 | 1, scroll: boolean): void {
    const marks = [...this.root.querySelectorAll<HTMLElement>('mark[data-search-mark]')];
    if (marks.length === 0) {
      this.applySearch(false);
      return;
    }
    this._matchIndex = (this._matchIndex + direction + marks.length) % marks.length;
    this.applySearch(scroll);
  }

  private removeSearchMarks(): void {
    for (const mark of this.root.querySelectorAll('mark[data-search-mark]')) {
      mark.replaceWith(document.createTextNode(mark.textContent ?? ''));
    }
    for (const code of this.root.querySelectorAll('.code-text')) {
      code.normalize();
    }
  }

  private applySearch(scroll: boolean): void {
    this.removeSearchMarks();
    const status = this.root.querySelector<HTMLElement>('[data-role="search-status"]');
    const query = this._query;
    if (!query) {
      if (status) status.textContent = '';
      return;
    }

    const matches: Array<{ node: Text; start: number; end: number }> = [];
    const useUnifiedSurface = this._view === 'unified' || (this._view === 'split' && this.getBoundingClientRect().width <= 760);
    for (const code of this.root.querySelectorAll<HTMLElement>('.code-text')) {
      const view = code.closest<HTMLElement>('.unified-lines, .split-lines');
      const isUnifiedSurface = view?.classList.contains('unified-lines') === true;
      const isActiveSurface = isUnifiedSurface === useUnifiedSurface;
      if (!isActiveSurface) {
        continue;
      }
      const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const text = node as Text;
        const lowerText = text.data.toLocaleLowerCase();
        const lowerQuery = query.toLocaleLowerCase();
        let start = 0;
        while (start < lowerText.length) {
          const found = lowerText.indexOf(lowerQuery, start);
          if (found === -1) break;
          matches.push({ node: text, start: found, end: found + query.length });
          start = found + Math.max(query.length, 1);
        }
        node = walker.nextNode();
      }
    }

    if (matches.length === 0) {
      this._matchIndex = 0;
      if (status) status.textContent = 'No matches';
      return;
    }

    this._matchIndex %= matches.length;
    const byNode = new Map<Text, Array<{ start: number; end: number; index: number }>>();
    matches.forEach((match, index) => {
      const entries = byNode.get(match.node) ?? [];
      entries.push({ start: match.start, end: match.end, index });
      byNode.set(match.node, entries);
    });

    for (const [node, entries] of byNode) {
      for (const entry of [...entries].reverse()) {
        const range = document.createRange();
        range.setStart(node, entry.start);
        range.setEnd(node, entry.end);
        const mark = document.createElement('mark');
        mark.dataset.searchMark = 'true';
        mark.dataset.active = String(entry.index === this._matchIndex);
        range.surroundContents(mark);
      }
    }

    // Split mode keeps a unified fallback in the DOM for narrow screens. If
    // layout changed during an input event, remove any marks on the inactive
    // surface and derive the counter from what is actually visible.
    const activeSurfaceSelector = useUnifiedSurface ? '.unified-lines' : '.split-lines';
    for (const mark of this.root.querySelectorAll<HTMLElement>('mark[data-search-mark]')) {
      if (!mark.closest(activeSurfaceSelector)) {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ''));
      }
    }
    const activeMarks = [...this.root.querySelectorAll<HTMLElement>(`${activeSurfaceSelector} mark[data-search-mark]`)];
    this._matchIndex %= activeMarks.length;
    activeMarks.forEach((mark, index) => {
      mark.dataset.active = String(index === this._matchIndex);
    });

    if (status) status.textContent = `${this._matchIndex + 1}/${activeMarks.length}`;
    if (scroll) {
      this.root.querySelector<HTMLElement>('mark[data-search-mark][data-active="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  private async copyNewText(): Promise<void> {
    const diff = this.getDiffDocument();
    const text = diff.newText;
    if (!text) {
      this.setText('[data-role="status"]', 'There is no updated text to copy.');
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      this.setText('[data-role="status"]', `Copied ${text.split('\n').length} updated lines.`);
      this.dispatchEvent(new CustomEvent('diff-copy', {
        bubbles: true,
        composed: true,
        detail: { text },
      }));
    } catch {
      this.setText('[data-role="status"]', 'Copy was blocked by the browser. Select the updated text manually.');
    }
  }
}
