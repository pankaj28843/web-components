export const diffViewerStyles = `
:host {
  --wc-canvas: #ffffff;
  --wc-canvas-subtle: #f6f8fa;
  --wc-canvas-inset: #f0f2f4;
  --wc-border: #d0d7de;
  --wc-border-muted: #d8dee4;
  --wc-fg: #1f2328;
  --wc-muted: #656d76;
  --wc-accent: #0969da;
  --wc-accent-muted: #ddf4ff;
  --wc-added: #1a7f37;
  --wc-added-bg: #dafbe1;
  --wc-added-gutter: #aceebb;
  --wc-removed: #cf222e;
  --wc-removed-bg: #ffebe9;
  --wc-removed-gutter: #ffcecb;
  --wc-warning: #9a6700;
  --wc-warning-bg: #fff8c5;
  --wc-code-font: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  --wc-font-size-heading: 1rem;
  --wc-font-size-base: 0.875rem;
  --wc-font-size-compact: 0.75rem;
  display: block;
  min-width: 0;
  color: var(--wc-fg);
  font: 400 var(--wc-font-size-base)/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
  border-radius: 0.4rem;
  background: var(--wc-canvas);
  box-shadow: 0 0.25rem 1rem rgb(31 35 40 / 8%);
}

.slot-region[hidden],
[data-role="default-heading"][hidden] {
  display: none;
}

.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.85rem;
  background: var(--wc-canvas);
}

.heading-copy,
.file-heading-copy {
  min-width: 0;
  flex: 1 1 auto;
}

h2 {
  margin: 0;
  color: var(--wc-fg);
  font-size: var(--wc-font-size-heading);
  line-height: 1.25;
}

.header-slot {
  padding: 1rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas);
}

.source-badge {
  flex: 0 0 auto;
  border: 1px solid var(--wc-border);
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-block: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
}

.control-group,
.field {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.control-group {
  overflow: hidden;
  border: 1px solid var(--wc-border);
  border-radius: 0.35rem;
}

.field {
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  font-weight: 600;
}

.field > span {
  white-space: nowrap;
}

button,
select,
input {
  min-height: 2rem;
  border: 1px solid var(--wc-border);
  border-radius: 0.35rem;
  background: var(--wc-canvas);
  color: var(--wc-fg);
  font: inherit;
}

button {
  cursor: pointer;
  padding: 0.25rem 0.55rem;
  font-size: var(--wc-font-size-compact);
  font-weight: 600;
}

.control-group button {
  border: 0;
  border-radius: 0;
}

button:hover,
select:hover,
input:hover {
  border-color: var(--wc-accent);
}

button[aria-pressed="true"] {
  background: var(--wc-accent-muted);
  color: var(--wc-accent);
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 2px solid var(--wc-accent);
  outline-offset: 1px;
}

select,
input[type="search"] {
  padding: 0.25rem 0.5rem;
}

select {
  max-width: 11rem;
}

input[type="search"] {
  width: min(15rem, 32vw);
}

input[type="checkbox"] {
  width: 1rem;
  min-height: 1rem;
  accent-color: var(--wc-accent);
}

.search-field {
  margin-left: auto;
}

.search-status {
  min-width: 4rem;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  white-space: nowrap;
}

.toolbar-slot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas);
}

.stat {
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  background: var(--wc-canvas-subtle);
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  font-weight: 600;
}

.stat[data-stat="added"] {
  color: var(--wc-added);
}

.stat[data-stat="removed"] {
  color: var(--wc-removed);
}

.line-summary {
  margin-left: auto;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
}

.review-layout {
  display: grid;
  grid-template-columns: minmax(12rem, 17rem) minmax(0, 1fr);
  min-width: 0;
  align-items: start;
}

.file-nav {
  position: sticky;
  top: 0;
  min-width: 0;
  max-height: min(70vh, 46rem);
  overflow: auto;
  border-right: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
}

.file-nav-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  z-index: 1;
  top: 0;
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
  color: var(--wc-fg);
  font-size: var(--wc-font-size-compact);
}

.file-nav-count {
  display: inline-grid;
  min-width: 1.35rem;
  min-height: 1.35rem;
  place-items: center;
  border-radius: 999px;
  background: var(--wc-border-muted);
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
}

.file-nav-list {
  padding: 0.25rem;
}

.file-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 0.3rem;
  padding: 0.38rem 0.45rem;
  background: transparent;
  color: var(--wc-fg);
  text-align: left;
}

.file-nav-item:hover {
  background: var(--wc-canvas-inset);
}

.file-nav-path {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  overflow: hidden;
}

.file-nav-path > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-counts {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.3rem;
  font: 600 var(--wc-font-size-compact)/1 var(--wc-code-font);
  white-space: nowrap;
}

.file-additions {
  color: var(--wc-added);
}

.file-deletions {
  color: var(--wc-removed);
}

.status-badge {
  display: inline-grid;
  flex: 0 0 auto;
  width: 1.1rem;
  height: 1.1rem;
  place-items: center;
  border-radius: 0.2rem;
  background: var(--wc-canvas-inset);
  color: var(--wc-muted);
  font: 700 var(--wc-font-size-compact)/1 var(--wc-code-font);
}

.status-badge[data-status="added"] {
  background: var(--wc-added-bg);
  color: var(--wc-added);
}

.status-badge[data-status="deleted"] {
  background: var(--wc-removed-bg);
  color: var(--wc-removed);
}

.status-badge[data-status="renamed"],
.status-badge[data-status="copied"] {
  background: var(--wc-accent-muted);
  color: var(--wc-accent);
}

.status-badge[data-status="binary"],
.status-badge[data-status="unsupported"] {
  background: var(--wc-warning-bg);
  color: var(--wc-warning);
}

.file-list {
  min-width: 0;
  padding: 0.75rem;
  background: var(--wc-canvas);
}

.file-card {
  min-width: 0;
  margin: 0 0 0.75rem;
  overflow: hidden;
  border: 1px solid var(--wc-border);
  border-radius: 0.4rem;
  background: var(--wc-canvas);
}

.file-card:last-child {
  margin-bottom: 0;
}

.file-header {
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
}

.file-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  min-width: 0;
  padding: 0.65rem 0.7rem;
}

.file-toggle {
  flex: 0 0 auto;
  width: 1.55rem;
  min-height: 1.55rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-heading);
  line-height: 1;
}

.file-toggle:hover {
  border: 0;
  color: var(--wc-accent);
}

.file-path-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.file-path {
  min-width: 0;
  overflow: hidden;
  color: var(--wc-fg);
  font: 600 var(--wc-font-size-base)/1.35 var(--wc-code-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-previous-path,
.file-meta {
  overflow: hidden;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-previous-path {
  margin-top: 0.18rem;
  font-family: var(--wc-code-font);
}

.file-meta {
  margin-top: 0.18rem;
}

.file-header-stats {
  margin-left: auto;
  padding-top: 0.2rem;
}

.file-body {
  min-width: 0;
}

.file-warnings {
  margin: 0;
  padding: 0.55rem 1rem 0.55rem 2rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-warning-bg);
  color: var(--wc-warning);
  font-size: var(--wc-font-size-compact);
}

.hunk-list {
  min-width: 0;
}

.hunk {
  min-width: 0;
  border-top: 1px solid var(--wc-border);
}

.hunk:first-child {
  border-top: 0;
}

.hunk-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  position: sticky;
  z-index: 1;
  top: 0;
  min-width: 0;
  padding: 0.42rem 0.7rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-accent-muted);
  color: var(--wc-accent);
  font-size: var(--wc-font-size-compact);
}

.hunk-marker {
  color: var(--wc-accent);
  font: 700 var(--wc-font-size-compact)/1 var(--wc-code-font);
}

.hunk-header code {
  overflow: hidden;
  font: 600 var(--wc-font-size-compact)/1.4 var(--wc-code-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hunk-context {
  overflow: hidden;
  color: var(--wc-muted);
  font: 400 var(--wc-font-size-compact)/1.4 var(--wc-code-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diff-lines {
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-color: var(--wc-border) var(--wc-canvas-subtle);
}

.unified-lines {
  min-width: 42rem;
}

.unified-labels {
  display: grid;
  grid-template-columns: 3.6rem 3.6rem 1.25rem minmax(30rem, 1fr);
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
  color: var(--wc-muted);
  font: 600 var(--wc-font-size-compact)/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.unified-labels > span {
  min-width: 0;
  overflow: hidden;
  padding: 0.35rem 0.55rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unified-labels > span:last-child {
  border-left: 1px solid color-mix(in srgb, var(--wc-border) 70%, transparent);
}

.unified-line,
.split-line {
  min-width: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--wc-border) 65%, transparent);
  font-family: var(--wc-code-font);
}

.unified-line {
  display: grid;
  grid-template-columns: 3.6rem 3.6rem 1.25rem minmax(30rem, 1fr);
}

.unified-line[data-kind="added"] {
  background: var(--wc-added-bg);
}

.unified-line[data-kind="removed"] {
  background: var(--wc-removed-bg);
}

.line-number {
  min-height: 1.75rem;
  padding: 0.3rem 0.55rem;
  background: color-mix(in srgb, var(--wc-canvas-inset) 52%, transparent);
  color: var(--wc-muted);
  font: var(--wc-font-size-compact)/1.25 var(--wc-code-font);
  text-align: right;
  user-select: none;
}

.unified-line[data-kind="added"] .line-number-new,
.split-side[data-kind="added"] .line-number-new {
  background: var(--wc-added-gutter);
}

.unified-line[data-kind="removed"] .line-number-old,
.split-side[data-kind="removed"] .line-number-old {
  background: var(--wc-removed-gutter);
}

.line-marker {
  min-height: 1.75rem;
  padding-top: 0.3rem;
  color: var(--wc-muted);
  font: var(--wc-font-size-compact)/1.25 var(--wc-code-font);
  text-align: center;
  user-select: none;
}

.unified-line[data-kind="added"] .line-marker,
.split-side[data-kind="added"] .line-marker {
  color: var(--wc-added);
}

.unified-line[data-kind="removed"] .line-marker,
.split-side[data-kind="removed"] .line-marker {
  color: var(--wc-removed);
}

.code-cell {
  display: flex;
  min-width: 0;
  border-left: 1px solid color-mix(in srgb, var(--wc-border) 70%, transparent);
}

.code-line {
  min-width: 0;
  flex: 1 1 auto;
  margin: 0;
  padding: 0.3rem 0.75rem 0.3rem 0.35rem;
  color: var(--wc-fg);
  font: var(--wc-font-size-compact)/1.5 var(--wc-code-font);
  tab-size: 2;
  white-space: pre;
}

.code-text {
  display: block;
  min-height: 1.1em;
}

.diff-lines[data-wrap="true"] .code-line {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.empty-code {
  min-width: 1ch;
}

.no-newline {
  align-self: center;
  flex: 0 0 auto;
  margin: 0 0.6rem 0 0.25rem;
  color: var(--wc-muted);
  font: var(--wc-font-size-compact)/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  white-space: nowrap;
}

.split-lines {
  display: none;
  min-width: 62rem;
}

.split-labels,
.split-line {
  display: grid;
  grid-template-columns: repeat(2, minmax(31rem, 1fr));
}

.split-labels {
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
  font-weight: 600;
}

.split-labels > span {
  padding: 0.35rem 0.65rem;
}

.split-labels > span + span,
.split-side + .split-side {
  border-left: 1px solid var(--wc-border);
}

.split-side {
  display: grid;
  grid-template-columns: 3.6rem 1.25rem minmax(24rem, 1fr);
  min-width: 0;
}

.split-side[data-kind="added"] {
  background: var(--wc-added-bg);
}

.split-side[data-kind="removed"] {
  background: var(--wc-removed-bg);
}

.diff-lines[data-view="split"] .unified-lines {
  display: none;
}

.diff-lines[data-view="split"] .split-lines {
  display: block;
}

.mobile-split-note {
  display: none;
  margin: 0;
  padding: 0.45rem 0.7rem;
  border-bottom: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
}

.inline-state {
  display: grid;
  gap: 0.25rem;
  padding: 2.5rem 1rem;
  color: var(--wc-muted);
  text-align: center;
}

.inline-state strong {
  color: var(--wc-fg);
}

.inline-state[data-state="warning"] {
  background: var(--wc-warning-bg);
  color: var(--wc-warning);
}

.inline-state[data-state="error"] {
  color: var(--wc-removed);
}

.status {
  min-height: 1.2rem;
  margin: 0;
  padding: 0.55rem 1rem 0.7rem;
  color: var(--wc-muted);
  font-size: var(--wc-font-size-compact);
}

.footer-slot {
  padding: 0.7rem 1rem;
  border-top: 1px solid var(--wc-border);
  background: var(--wc-canvas-subtle);
}

.mobile-note {
  display: none;
}

.hljs-comment,
.hljs-quote {
  color: #6e7781;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #8250df;
}

.hljs-string,
.hljs-attr,
.hljs-addition,
.hljs-symbol,
.hljs-bullet {
  color: #116329;
}

.hljs-number,
.hljs-regexp,
.hljs-variable,
.hljs-template-variable {
  color: #953800;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.function_,
.hljs-type,
.hljs-built_in {
  color: #0550ae;
}

.hljs-meta,
.hljs-meta .hljs-keyword {
  color: #cf222e;
}

mark[data-search-mark] {
  border-radius: 0.15rem;
  background: #fff8c5;
  color: #1f2328;
  box-shadow: 0 0 0 1px #d4a72c;
}

mark[data-search-mark][data-active="true"] {
  background: #ffb700;
  box-shadow: 0 0 0 2px #9a6700;
}

@media (prefers-color-scheme: dark) {
  :host {
    --wc-canvas: #0d1117;
    --wc-canvas-subtle: #161b22;
    --wc-canvas-inset: #21262d;
    --wc-border: #30363d;
    --wc-border-muted: #30363d;
    --wc-fg: #e6edf3;
    --wc-muted: #8b949e;
    --wc-accent: #58a6ff;
    --wc-accent-muted: #12263d;
    --wc-added: #3fb950;
    --wc-added-bg: #12261b;
    --wc-added-gutter: #1d4427;
    --wc-removed: #f85149;
    --wc-removed-bg: #2b1718;
    --wc-removed-gutter: #55201f;
    --wc-warning: #d29922;
    --wc-warning-bg: #2d220d;
  }

  .hljs-comment,
  .hljs-quote { color: #8b949e; }
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-literal,
  .hljs-section,
  .hljs-link { color: #ff7b72; }
  .hljs-string,
  .hljs-attr,
  .hljs-addition,
  .hljs-symbol,
  .hljs-bullet { color: #a5d6ff; }
  .hljs-number,
  .hljs-regexp,
  .hljs-variable,
  .hljs-template-variable { color: #79c0ff; }
  .hljs-title,
  .hljs-title.class_,
  .hljs-title.function_,
  .hljs-type,
  .hljs-built_in { color: #d2a8ff; }
  mark[data-search-mark] { background: #bb8009; color: #fff; }
  mark[data-search-mark][data-active="true"] { background: #f0883e; }
}

:host([data-theme="light"]) {
  --wc-canvas: #ffffff;
  --wc-canvas-subtle: #f6f8fa;
  --wc-canvas-inset: #f0f2f4;
  --wc-border: #d0d7de;
  --wc-border-muted: #d8dee4;
  --wc-fg: #1f2328;
  --wc-muted: #656d76;
  --wc-accent: #0969da;
  --wc-accent-muted: #ddf4ff;
  --wc-added: #1a7f37;
  --wc-added-bg: #dafbe1;
  --wc-added-gutter: #aceebb;
  --wc-removed: #cf222e;
  --wc-removed-bg: #ffebe9;
  --wc-removed-gutter: #ffcecb;
  --wc-warning: #9a6700;
  --wc-warning-bg: #fff8c5;
  color-scheme: light;
}

:host([data-theme="light"]) .hljs-comment,
:host([data-theme="light"]) .hljs-quote { color: #6e7781; }
:host([data-theme="light"]) .hljs-keyword,
:host([data-theme="light"]) .hljs-selector-tag,
:host([data-theme="light"]) .hljs-literal,
:host([data-theme="light"]) .hljs-section,
:host([data-theme="light"]) .hljs-link { color: #8250df; }
:host([data-theme="light"]) .hljs-string,
:host([data-theme="light"]) .hljs-attr,
:host([data-theme="light"]) .hljs-addition,
:host([data-theme="light"]) .hljs-symbol,
:host([data-theme="light"]) .hljs-bullet { color: #116329; }
:host([data-theme="light"]) .hljs-number,
:host([data-theme="light"]) .hljs-regexp,
:host([data-theme="light"]) .hljs-variable,
:host([data-theme="light"]) .hljs-template-variable { color: #953800; }
:host([data-theme="light"]) .hljs-title,
:host([data-theme="light"]) .hljs-title.class_,
:host([data-theme="light"]) .hljs-title.function_,
:host([data-theme="light"]) .hljs-type,
:host([data-theme="light"]) .hljs-built_in { color: #0550ae; }
:host([data-theme="light"]) .hljs-meta,
:host([data-theme="light"]) .hljs-meta .hljs-keyword { color: #cf222e; }
:host([data-theme="light"]) mark[data-search-mark] {
  background: #fff8c5;
  color: #1f2328;
  box-shadow: 0 0 0 1px #d4a72c;
}
:host([data-theme="light"]) mark[data-search-mark][data-active="true"] {
  background: #ffb700;
  box-shadow: 0 0 0 2px #9a6700;
}

:host([data-theme="dark"]) {
  --wc-canvas: #0d1117;
  --wc-canvas-subtle: #161b22;
  --wc-canvas-inset: #21262d;
  --wc-border: #30363d;
  --wc-border-muted: #30363d;
  --wc-fg: #e6edf3;
  --wc-muted: #8b949e;
  --wc-accent: #58a6ff;
  --wc-accent-muted: #12263d;
  --wc-added: #3fb950;
  --wc-added-bg: #12261b;
  --wc-added-gutter: #1d4427;
  --wc-removed: #f85149;
  --wc-removed-bg: #2b1718;
  --wc-removed-gutter: #55201f;
  --wc-warning: #d29922;
  --wc-warning-bg: #2d220d;
  color-scheme: dark;
}

:host([data-theme="dark"]) .hljs-comment,
:host([data-theme="dark"]) .hljs-quote { color: #8b949e; }
:host([data-theme="dark"]) .hljs-keyword,
:host([data-theme="dark"]) .hljs-selector-tag,
:host([data-theme="dark"]) .hljs-literal,
:host([data-theme="dark"]) .hljs-section,
:host([data-theme="dark"]) .hljs-link { color: #ff7b72; }
:host([data-theme="dark"]) .hljs-string,
:host([data-theme="dark"]) .hljs-attr,
:host([data-theme="dark"]) .hljs-addition,
:host([data-theme="dark"]) .hljs-symbol,
:host([data-theme="dark"]) .hljs-bullet { color: #a5d6ff; }
:host([data-theme="dark"]) .hljs-number,
:host([data-theme="dark"]) .hljs-regexp,
:host([data-theme="dark"]) .hljs-variable,
:host([data-theme="dark"]) .hljs-template-variable { color: #79c0ff; }
:host([data-theme="dark"]) .hljs-title,
:host([data-theme="dark"]) .hljs-title.class_,
:host([data-theme="dark"]) .hljs-title.function_,
:host([data-theme="dark"]) .hljs-type,
:host([data-theme="dark"]) .hljs-built_in { color: #d2a8ff; }
:host([data-theme="dark"]) mark[data-search-mark] { background: #bb8009; color: #fff; }
:host([data-theme="dark"]) mark[data-search-mark][data-active="true"] { background: #f0883e; }

@media (max-width: 760px) {
  .heading {
    padding: 0.85rem;
  }

  .toolbar,
  .summary,
  .header-slot,
  .footer-slot {
    padding-inline: 0.75rem;
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

  .review-layout {
    display: block;
  }

  .file-nav {
    position: static;
    max-height: 13rem;
    border-right: 0;
    border-bottom: 1px solid var(--wc-border);
  }

  .file-nav-heading {
    position: static;
  }

  .file-list {
    padding: 0.5rem;
  }

  .file-heading {
    padding: 0.6rem 0.55rem;
  }

  .file-header-stats {
    display: none;
  }

  .file-meta {
    white-space: normal;
  }

  .diff-lines[data-view="split"] .unified-lines {
    display: block;
  }

  .diff-lines[data-view="split"] .split-lines {
    display: none;
  }

  .diff-lines[data-view="split"] .mobile-split-note {
    display: block;
  }

  .unified-lines {
    min-width: 39rem;
  }

  .unified-line {
    grid-template-columns: 3rem 3rem 1.15rem minmax(28rem, 1fr);
  }

  .unified-labels {
    grid-template-columns: 3rem 3rem 1.15rem minmax(28rem, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;
