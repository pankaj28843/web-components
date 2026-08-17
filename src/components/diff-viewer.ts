import type { DiffDocument, DiffRow, DiffRowKind } from '../diff/model';
import { createDiff, parseUnifiedDiff } from '../diff/model';
import { getLanguageOptions, highlightCode, normalizeLanguage } from '../highlight/registry';
import { BaseElement } from '../platform/base-element';

type ViewMode = 'unified' | 'split';

const styles = `
:host {
  --wc-bg: #10131a;
  --wc-surface: #171c26;
  --wc-surface-raised: #202735;
  --wc-border: #30394a;
  --wc-text: #edf2f7;
  --wc-muted: #aab5c5;
  --wc-accent: #8bd5ca;
  --wc-focus: #f5c76b;
  --wc-added-bg: color-mix(in srgb, #2fa36b 18%, transparent);
  --wc-removed-bg: color-mix(in srgb, #d56868 18%, transparent);
  --wc-code-font: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  display: block;
  min-width: 0;
  color: var(--wc-text);
  font: 400 0.95rem/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

:host([hidden]) {
  display: none;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.shell {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--wc-border);
  border-radius: 1rem;
  background: var(--wc-bg);
  box-shadow: 0 1.25rem 3rem rgb(0 0 0 / 20%);
}

.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.25rem 1.25rem 1rem;
  background: linear-gradient(135deg, #1b2634, #11151e 68%);
}

.heading-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: var(--wc-accent);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: var(--wc-text);
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.2;
}

.subtitle {
  max-width: 62ch;
  margin: 0.45rem 0 0;
  color: var(--wc-muted);
  font-size: 0.85rem;
}

.source-badge {
  flex: 0 0 auto;
  border: 1px solid rgb(139 213 202 / 35%);
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  color: var(--wc-accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.65rem;
  padding: 0.8rem 1.25rem;
  border-block: 1px solid var(--wc-border);
  background: var(--wc-surface);
}

.control-group,
.field {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.control-group {
  flex-wrap: wrap;
}

.field {
  color: var(--wc-muted);
  font-size: 0.76rem;
  font-weight: 650;
}

.field > span {
  white-space: nowrap;
}

button,
select,
input {
  min-height: 2.15rem;
  border: 1px solid var(--wc-border);
  border-radius: 0.55rem;
  background: var(--wc-surface-raised);
  color: var(--wc-text);
  font: inherit;
}

button {
  cursor: pointer;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 700;
}

button:hover,
select:hover,
input:hover {
  border-color: #53627a;
}

button[aria-pressed="true"] {
  border-color: var(--wc-accent);
  background: rgb(139 213 202 / 14%);
  color: var(--wc-accent);
}

select,
input[type="search"] {
  padding: 0.35rem 0.55rem;
}

select {
  max-width: 10rem;
}

input[type="search"] {
  width: min(15rem, 35vw);
}

input[type="checkbox"] {
  width: 1rem;
  min-height: 1rem;
  accent-color: var(--wc-accent);
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--wc-focus) 70%, transparent);
  outline-offset: 2px;
}

.search-field {
  margin-left: auto;
}

.search-status {
  min-width: 4.5rem;
  color: var(--wc-muted);
  font-size: 0.72rem;
  white-space: nowrap;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.25rem;
  background: var(--wc-surface);
}

.stat {
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: var(--wc-surface-raised);
  color: var(--wc-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.stat[data-stat="added"] {
  color: #8be3ad;
}

.stat[data-stat="removed"] {
  color: #f29b9b;
}

.line-summary {
  margin-left: auto;
  color: var(--wc-muted);
  font-size: 0.75rem;
}

.mobile-note {
  display: none;
  margin: 0;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--wc-border);
  background: #1d2532;
  color: var(--wc-muted);
  font-size: 0.76rem;
}

.code-scroll {
  min-width: 0;
  max-height: min(68vh, 48rem);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-color: #4a5870 var(--wc-surface);
}

.diff-table {
  min-width: 0;
  background: #0e1117;
}

.table-header,
.diff-row,
.split-row {
  display: grid;
  min-width: 0;
}

.table-header {
  position: sticky;
  z-index: 1;
  top: 0;
  grid-template-columns: 4.2rem 4.2rem minmax(20rem, 1fr);
  border-bottom: 1px solid var(--wc-border);
  background: #151b25;
  color: var(--wc-muted);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-header > div {
  min-width: 0;
  overflow: hidden;
  padding: 0.55rem 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unified-view .diff-row {
  grid-template-columns: 4.2rem 4.2rem minmax(20rem, 1fr);
}

.split-view .split-row {
  grid-template-columns: repeat(2, minmax(20rem, 1fr));
}

.split-view .table-header {
  grid-template-columns: repeat(2, minmax(20rem, 1fr));
}

.diff-row,
.split-row {
  border-bottom: 1px solid rgb(48 57 74 / 62%);
}

.diff-row:last-child,
.split-row:last-child {
  border-bottom: 0;
}

.diff-row[data-kind="added"],
.split-row[data-kind="added"] .side-cell[data-side="new"] {
  background: var(--wc-added-bg);
}

.diff-row[data-kind="removed"],
.split-row[data-kind="removed"] .side-cell[data-side="old"] {
  background: var(--wc-removed-bg);
}

.split-row[data-kind="modified"] .side-cell[data-side="old"] {
  background: var(--wc-removed-bg);
}

.split-row[data-kind="modified"] .side-cell[data-side="new"] {
  background: var(--wc-added-bg);
}

.line-number {
  min-height: 2rem;
  padding: 0.42rem 0.65rem;
  color: #748198;
  font: 0.73rem/1.25 var(--wc-code-font);
  text-align: right;
  user-select: none;
}

.code-cell,
.side-cell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
}

.code-cell {
  border-left: 1px solid rgb(48 57 74 / 62%);
}

.side-cell + .side-cell {
  border-left: 1px solid var(--wc-border);
}

.marker {
  width: 1rem;
  padding-top: 0.42rem;
  color: var(--wc-muted);
  font: 0.75rem/1.25 var(--wc-code-font);
  text-align: center;
  user-select: none;
}

[data-kind="added"] .marker {
  color: #8be3ad;
}

[data-kind="removed"] .marker {
  color: #f29b9b;
}

.code-line {
  min-width: 0;
  margin: 0;
  padding: 0.42rem 0.75rem 0.42rem 0.25rem;
  overflow: visible;
  color: #e7edf5;
  font: 0.78rem/1.45 var(--wc-code-font);
  white-space: pre;
  tab-size: 2;
}

.hljs-comment,
.hljs-quote {
  color: #8190a8;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #d7a7ff;
}

.hljs-string,
.hljs-attr,
.hljs-addition,
.hljs-symbol,
.hljs-bullet {
  color: #9fe3b5;
}

.hljs-number,
.hljs-regexp,
.hljs-variable,
.hljs-template-variable {
  color: #f5c76b;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.function_,
.hljs-type,
.hljs-built_in {
  color: #8bd5ca;
}

.hljs-meta,
.hljs-meta .hljs-keyword {
  color: #ff9f9f;
}

.hljs-deletion {
  color: #ffb0b0;
}

.diff-table[data-wrap="true"] .code-line {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.empty-code {
  display: inline-block;
  min-width: 1ch;
}

mark[data-search-mark] {
  border-radius: 0.18rem;
  background: #e4b84e;
  color: #17130b;
}

mark[data-search-mark][data-active="true"] {
  background: #ff7d4d;
  color: #180b06;
  box-shadow: 0 0 0 2px rgb(255 125 77 / 36%);
}

.state {
  padding: 3.5rem 1.25rem;
  color: var(--wc-muted);
  text-align: center;
}

.state strong {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--wc-text);
}

.state[data-state="error"] {
  color: #f5b3b3;
}

.state[data-state="error"] strong {
  color: #ff9f9f;
}

.status {
  min-height: 1.2rem;
  padding: 0.45rem 1.25rem 0.8rem;
  color: var(--wc-muted);
  font-size: 0.76rem;
}

.unified-view,
.split-view {
  display: none;
}

.diff-table[data-view="unified"] .unified-view,
.diff-table[data-view="split"] .split-view {
  display: block;
}

@media (max-width: 740px) {
  .heading {
    padding: 1rem;
  }

  .toolbar,
  .summary {
    padding-inline: 1rem;
  }

  .toolbar {
    align-items: stretch;
  }

  .search-field {
    width: 100%;
    margin-left: 0;
  }

  input[type="search"] {
    flex: 1;
    width: auto;
  }

  .line-summary {
    width: 100%;
    margin-left: 0;
  }

  .diff-table[data-view="split"] .split-view {
    display: none;
  }

  .diff-table[data-view="split"] .unified-view,
  .diff-table[data-view="split"] .mobile-note {
    display: block;
  }

  .table-header,
  .unified-view .diff-row {
    grid-template-columns: 3.3rem 3.3rem minmax(16rem, 1fr);
  }

  .split-view .table-header,
  .split-view .split-row {
    grid-template-columns: repeat(2, minmax(16rem, 1fr));
  }

  .code-line {
    padding-right: 0.55rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function isViewMode(value: string | null | undefined): value is ViewMode {
  return value === 'unified' || value === 'split';
}

function textOrEmpty(value: string | null): string {
  return value ?? '';
}

export class DiffViewerElement extends BaseElement {
  private _oldText = '';
  private _newText = '';
  private _diffText: string | null = null;
  private _language = 'plaintext';
  private _view: ViewMode = 'unified';
  private _wrap = false;
  private _query = '';
  private _matchIndex = 0;

  public constructor() {
    super();
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('change', this.handleChange);
    this.root.addEventListener('input', this.handleInput);
    this.root.addEventListener('keydown', this.handleKeydown);
  }

  public static get observedAttributes(): string[] {
    return ['language', 'view', 'wrap', 'title'];
  }

  public get oldText(): string {
    return this._oldText;
  }

  public set oldText(value: string) {
    this._oldText = value;
    this._diffText = null;
    this.requestRender();
  }

  public get newText(): string {
    return this._newText;
  }

  public set newText(value: string) {
    this._newText = value;
    this._diffText = null;
    this.requestRender();
  }

  public get diffText(): string {
    return this._diffText ?? '';
  }

  public set diffText(value: string) {
    this._diffText = value;
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
    this.root.innerHTML = `<style>${styles}</style>
      <section class="shell" aria-labelledby="diff-viewer-title">
        <header class="heading">
          <div class="heading-copy">
            <p class="eyebrow">Text change review</p>
            <h2 id="diff-viewer-title" data-role="title"></h2>
            <p class="subtitle">Compare plain text with readable line provenance, focused search, and optional syntax highlighting.</p>
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
            <input type="checkbox" data-field="wrap" />
            <span>Wrap lines</span>
          </label>
          <label class="field search-field">
            <span>Find</span>
            <input type="search" data-field="search" placeholder="Search changed text" autocomplete="off" spellcheck="false" aria-label="Search changed text" />
            <span class="search-status" data-role="search-status" aria-live="polite"></span>
          </label>
          <button type="button" data-action="previous" aria-label="Previous search match">↑</button>
          <button type="button" data-action="next" aria-label="Next search match">↓</button>
          <button type="button" data-action="copy">Copy new text</button>
        </div>
        <div class="summary" aria-label="Diff statistics">
          <span class="stat" data-stat="added"></span>
          <span class="stat" data-stat="removed"></span>
          <span class="stat" data-stat="changed"></span>
          <span class="line-summary" data-role="line-summary"></span>
        </div>
        <div class="code-scroll" data-role="body"></div>
        <p class="status" data-role="status" aria-live="polite"></p>
      </section>`;

    const title = this.getAttribute('title')?.trim() || 'Diff viewer';
    const oldLabel = this.getAttribute('old-label')?.trim() || 'Original';
    const newLabel = this.getAttribute('new-label')?.trim() || 'Updated';
    this.setText('[data-role="title"]', title);
    this.setText('[data-role="source"]', diff.source === 'unified' ? 'UNIFIED PATCH' : 'OLD / NEW TEXT');
    this.setText('[data-stat="added"]', `+${diff.stats.added} added`);
    this.setText('[data-stat="removed"]', `−${diff.stats.removed} removed`);
    this.setText('[data-stat="changed"]', `${diff.stats.changed} changed lines`);
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

    this.renderRows(diff, oldLabel, newLabel);
    this.applySearch(false);
  }

  private getDiffDocument(): DiffDocument {
    if (this._diffText !== null) {
      return parseUnifiedDiff(this._diffText);
    }
    return createDiff(this._oldText, this._newText);
  }

  private setText(selector: string, value: string): void {
    const element = this.root.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  private renderRows(diff: DiffDocument, oldLabel: string, newLabel: string): void {
    const body = this.root.querySelector<HTMLElement>('[data-role="body"]');
    if (!body) {
      return;
    }
    body.replaceChildren();

    if (diff.error) {
      body.append(this.createState('error', 'Unable to read this patch', diff.error));
      this.setText('[data-role="status"]', 'Fix the patch format or provide oldText and newText instead.');
      return;
    }

    if (diff.rows.length === 0) {
      body.append(this.createState('empty', 'No changes to display', 'Set oldText and newText, or provide a unified diff.'));
      this.setText('[data-role="status"]', 'The inputs are identical or empty.');
      return;
    }

    const table = document.createElement('div');
    table.className = 'diff-table';
    table.dataset.view = this._view;
    table.dataset.wrap = String(this._wrap);
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Text difference');

    const mobileNote = document.createElement('p');
    mobileNote.className = 'mobile-note';
    mobileNote.textContent = 'Split view becomes a single readable column on narrow screens.';
    table.append(mobileNote);

    const unified = document.createElement('div');
    unified.className = 'unified-view';
    unified.setAttribute('role', 'rowgroup');
    unified.append(this.createHeader(oldLabel, newLabel, 'Change'));
    for (const row of diff.rows) {
      if (row.kind === 'modified') {
        unified.append(this.createUnifiedLine(row, 'removed', row.oldLine, null, row.oldText));
        unified.append(this.createUnifiedLine(row, 'added', null, row.newLine, row.newText));
      } else {
        unified.append(this.createUnifiedLine(row, row.kind, row.oldLine, row.newLine, row.newText ?? row.oldText));
      }
    }

    const split = document.createElement('div');
    split.className = 'split-view';
    split.setAttribute('role', 'rowgroup');
    split.append(this.createHeader(oldLabel, newLabel));
    for (const row of diff.rows) {
      split.append(this.createSplitRow(row));
    }

    table.append(unified, split);
    body.append(table);
    this.setText('[data-role="status"]', diff.rows.length > 1000 ? `Large diff: ${diff.rows.length} logical rows rendered.` : `${diff.rows.length} logical rows rendered.`);
  }

  private createHeader(oldLabel: string, newLabel: string, codeLabel?: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'table-header';
    header.setAttribute('role', 'row');
    const labels = codeLabel === undefined ? [oldLabel, newLabel] : [oldLabel, newLabel, codeLabel];
    for (const text of labels) {
      const cell = document.createElement('div');
      cell.setAttribute('role', 'columnheader');
      cell.title = text;
      cell.textContent = text;
      header.append(cell);
    }
    return header;
  }

  private createUnifiedLine(
    row: DiffRow,
    kind: DiffRowKind,
    oldLine: number | null,
    newLine: number | null,
    text: string | null,
  ): HTMLElement {
    const element = document.createElement('div');
    element.className = 'diff-row';
    element.dataset.kind = kind;
    element.dataset.rowId = row.id;
    element.setAttribute('role', 'row');
    element.setAttribute('aria-label', `${kind} line ${newLine ?? oldLine ?? ''}`.trim());
    element.append(this.createLineNumber(oldLine), this.createLineNumber(newLine), this.createCodeCell(text, kind === 'added' ? '+' : kind === 'removed' ? '−' : ' ', kind));
    return element;
  }

  private createSplitRow(row: DiffRow): HTMLElement {
    const element = document.createElement('div');
    element.className = 'split-row';
    element.dataset.kind = row.kind;
    element.dataset.rowId = row.id;
    element.setAttribute('role', 'row');
    element.setAttribute('aria-label', `${row.kind} old line ${row.oldLine ?? 'none'}, new line ${row.newLine ?? 'none'}`);
    element.append(
      this.createSideCell('old', row.oldLine, row.oldText, row),
      this.createSideCell('new', row.newLine, row.newText, row),
    );
    return element;
  }

  private createLineNumber(line: number | null): HTMLElement {
    const number = document.createElement('span');
    number.className = 'line-number';
    number.setAttribute('role', 'cell');
    number.setAttribute('aria-hidden', 'true');
    number.textContent = line === null ? '·' : String(line);
    return number;
  }

  private createSideCell(side: 'old' | 'new', line: number | null, text: string | null, row: DiffRow): HTMLElement {
    const cell = document.createElement('div');
    cell.className = 'side-cell';
    cell.dataset.side = side;
    cell.setAttribute('role', 'cell');
    cell.append(this.createLineNumber(line), this.createCodeCell(text, side === 'old' ? '−' : '+', row.kind));
    return cell;
  }

  private createCodeCell(text: string | null, markerText: string, kind: DiffRowKind): HTMLElement {
    const cell = document.createElement('div');
    cell.className = 'code-cell';
    cell.setAttribute('role', 'cell');
    cell.dataset.kind = kind;

    const marker = document.createElement('span');
    marker.className = 'marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = markerText;

    const pre = document.createElement('pre');
    pre.className = 'code-line';
    const code = document.createElement('code');
    code.className = 'code-text';
    code.dataset.raw = textOrEmpty(text);
    if (text === null) {
      code.className = 'code-text empty-code';
      code.setAttribute('aria-label', 'No line on this side');
      code.textContent = ' ';
    } else {
      code.innerHTML = highlightCode(text, this._language);
    }
    pre.append(code);
    cell.append(marker, pre);
    return cell;
  }

  private createState(state: 'empty' | 'error', heading: string, message: string): HTMLElement {
    const element = document.createElement('div');
    element.className = 'state';
    element.dataset.state = state;
    element.setAttribute('role', state === 'error' ? 'alert' : 'status');
    const title = document.createElement('strong');
    title.textContent = heading;
    const body = document.createElement('span');
    body.textContent = message;
    element.append(title, body);
    return element;
  }

  private handleClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (!action) {
      return;
    }

    if (action === 'view') {
      const value = target.closest<HTMLElement>('[data-action="view"]')?.dataset.value;
      if (isViewMode(value)) {
        this.view = value;
      }
    } else if (action === 'previous') {
      this.moveMatch(-1, true);
    } else if (action === 'next') {
      this.moveMatch(1, true);
    } else if (action === 'copy') {
      void this.copyNewText();
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
      if (status) {
        status.textContent = '';
      }
      return;
    }

    const textNodes: Text[] = [];
    for (const code of this.root.querySelectorAll<HTMLElement>('.code-text')) {
      const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        textNodes.push(node as Text);
        node = walker.nextNode();
      }
    }

    const lowerQuery = query.toLocaleLowerCase();
    const matches: Array<{ node: Text; start: number; end: number }> = [];
    for (const node of textNodes) {
      const value = node.data;
      const lowerValue = value.toLocaleLowerCase();
      let start = 0;
      while (start < lowerValue.length) {
        const found = lowerValue.indexOf(lowerQuery, start);
        if (found === -1) {
          break;
        }
        matches.push({ node, start: found, end: found + query.length });
        start = found + Math.max(query.length, 1);
      }
    }

    if (matches.length === 0) {
      this._matchIndex = 0;
      if (status) {
        status.textContent = 'No matches';
      }
      return;
    }

    this._matchIndex = (this._matchIndex + matches.length) % matches.length;
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

    if (status) {
      status.textContent = `${this._matchIndex + 1}/${matches.length}`;
    }
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
