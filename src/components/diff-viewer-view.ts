import type { DiffDocument, DiffFile, DiffHunk, DiffLine } from '../diff/model';
import { highlightCodeForPath } from '../highlight/registry';

export type ViewMode = 'unified' | 'split';

export interface DiffRenderOptions {
  view: ViewMode;
  wrap: boolean;
  languageOverride?: string | null;
  oldLabel: string;
  newLabel: string;
  collapsedFiles: ReadonlySet<string>;
}

export interface DiffRenderResult {
  fileElements: Map<string, HTMLElement>;
  renderedLines: number;
}

interface SplitPair {
  oldLine: DiffLine | null;
  newLine: DiffLine | null;
}

function statusLabel(status: DiffFile['status']): string {
  switch (status) {
    case 'added': return 'added';
    case 'deleted': return 'deleted';
    case 'renamed': return 'renamed';
    case 'copied': return 'copied';
    case 'binary': return 'binary';
    case 'unsupported': return 'unsupported';
    default: return 'modified';
  }
}

function statusGlyph(status: DiffFile['status']): string {
  switch (status) {
    case 'added': return 'A';
    case 'deleted': return 'D';
    case 'renamed': return 'R';
    case 'copied': return 'C';
    case 'binary': return 'B';
    case 'unsupported': return '!';
    default: return 'M';
  }
}

function pathForFile(file: DiffFile): string {
  return file.path || file.newPath || file.oldPath || '(unknown path)';
}

function displayPath(file: DiffFile): string {
  const path = pathForFile(file);
  return path.startsWith('a/') || path.startsWith('b/') ? path.slice(2) : path;
}

function appendStatusBadge(parent: Element, file: DiffFile): void {
  const badge = document.createElement('span');
  badge.className = 'status-badge';
  badge.dataset.status = file.status;
  badge.setAttribute('aria-label', statusLabel(file.status));
  badge.textContent = statusGlyph(file.status);
  parent.append(badge);
}

function appendCounts(parent: Element, file: DiffFile): void {
  const counts = document.createElement('span');
  counts.className = 'file-counts';

  const additions = document.createElement('span');
  additions.className = 'file-additions';
  additions.textContent = `+${file.additions}`;

  const deletions = document.createElement('span');
  deletions.className = 'file-deletions';
  deletions.textContent = `−${file.deletions}`;

  counts.append(additions, deletions);
  parent.append(counts);
}

function appendWarningList(parent: Element, warnings: readonly string[]): void {
  if (warnings.length === 0) {
    return;
  }

  const list = document.createElement('ul');
  list.className = 'file-warnings';
  for (const warning of warnings) {
    const item = document.createElement('li');
    item.textContent = warning;
    list.append(item);
  }
  parent.append(list);
}

function createFileNavigation(files: readonly DiffFile[]): HTMLElement {
  const aside = document.createElement('aside');
  aside.className = 'file-nav';
  aside.setAttribute('aria-label', 'Changed files');

  const heading = document.createElement('div');
  heading.className = 'file-nav-heading';
  const headingText = document.createElement('strong');
  headingText.textContent = 'Files changed';
  const count = document.createElement('span');
  count.className = 'file-nav-count';
  count.textContent = String(files.length);
  heading.append(headingText, count);
  aside.append(heading);

  const list = document.createElement('div');
  list.className = 'file-nav-list';
  list.setAttribute('role', 'list');
  for (const file of files) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-nav-item';
    button.dataset.action = 'jump-file';
    button.dataset.fileId = file.id;
    button.setAttribute('aria-controls', file.id);
    button.title = displayPath(file);

    const path = document.createElement('span');
    path.className = 'file-nav-path';
    appendStatusBadge(path, file);
    const pathText = document.createElement('span');
    pathText.textContent = displayPath(file);
    path.append(pathText);
    button.append(path);
    appendCounts(button, file);
    list.append(button);
  }

  aside.append(list);
  return aside;
}

function createFileHeading(file: DiffFile, collapsed: boolean): HTMLElement {
  const header = document.createElement('header');
  header.className = 'file-header';

  const heading = document.createElement('div');
  heading.className = 'file-heading';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'file-toggle';
  toggle.dataset.action = 'toggle-file';
  toggle.dataset.fileId = file.id;
  toggle.setAttribute('aria-expanded', String(!collapsed));
  if (!collapsed) {
    toggle.setAttribute('aria-controls', `${file.id}-body`);
  }
  toggle.setAttribute('aria-label', `${collapsed ? 'Expand' : 'Collapse'} ${displayPath(file)}`);
  toggle.textContent = collapsed ? '›' : '⌄';

  const copy = document.createElement('div');
  copy.className = 'file-heading-copy';
  const pathRow = document.createElement('div');
  pathRow.className = 'file-path-row';
  appendStatusBadge(pathRow, file);
  const path = document.createElement('code');
  path.className = 'file-path';
  path.textContent = displayPath(file);
  pathRow.append(path);
  copy.append(pathRow);

  if (file.status === 'renamed' || file.status === 'copied') {
    const previous = document.createElement('div');
    previous.className = 'file-previous-path';
    previous.textContent = `${file.oldPath ?? '(unknown)'} → ${file.newPath ?? displayPath(file)}`;
    copy.append(previous);
  }

  const meta = document.createElement('div');
  meta.className = 'file-meta';
  const details = [statusLabel(file.status)];
  if (file.oldMode || file.newMode) {
    details.push(`mode ${file.oldMode ?? '—'} → ${file.newMode ?? '—'}`);
  }
  if (file.similarity !== null) {
    details.push(`${file.similarity}% similarity`);
  }
  if (file.indexOld && file.indexNew) {
    details.push(`index ${file.indexOld.slice(0, 7)}..${file.indexNew.slice(0, 7)}`);
  }
  meta.textContent = details.join(' · ');
  copy.append(meta);

  heading.append(toggle, copy);

  const stats = document.createElement('div');
  stats.className = 'file-header-stats';
  appendCounts(stats, file);
  heading.append(stats);
  header.append(heading);
  return header;
}

function createState(heading: string, message: string, state: 'empty' | 'warning' | 'error'): HTMLElement {
  const element = document.createElement('div');
  element.className = 'inline-state';
  element.dataset.state = state;
  const title = document.createElement('strong');
  title.textContent = heading;
  const body = document.createElement('span');
  body.textContent = message;
  element.append(title, body);
  return element;
}

function createLineNumber(value: number | null, side: 'old' | 'new'): HTMLElement {
  const number = document.createElement('span');
  number.className = `line-number line-number-${side}`;
  number.setAttribute('aria-label', `${side === 'old' ? 'Old' : 'New'} line ${value ?? 'blank'}`);
  number.textContent = value === null ? '' : String(value);
  return number;
}

function createCodeCell(
  line: DiffLine | null,
  file: DiffFile,
  languageOverride: string | null | undefined,
  side: 'old' | 'new' | 'unified',
): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'code-cell';
  cell.dataset.side = side;

  const code = document.createElement('code');
  code.className = 'code-text';
  if (!line) {
    code.classList.add('empty-code');
    code.setAttribute('aria-label', 'No line on this side');
    code.textContent = ' ';
  } else {
    code.dataset.raw = line.text;
    code.innerHTML = highlightCodeForPath(line.text, pathForFile(file), languageOverride);
    if (line.text.length === 0) {
      code.classList.add('empty-code');
      code.append(document.createTextNode(' '));
    }
  }

  const pre = document.createElement('pre');
  pre.className = 'code-line';
  pre.append(code);
  cell.append(pre);

  if (line?.noNewlineAtEnd) {
    const note = document.createElement('span');
    note.className = 'no-newline';
    note.textContent = 'No newline at end of file';
    cell.append(note);
  }
  return cell;
}

function createMarker(line: DiffLine | null): HTMLElement {
  const marker = document.createElement('span');
  marker.className = 'line-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = line?.kind === 'added' ? '+' : line?.kind === 'removed' ? '−' : ' ';
  return marker;
}

function lineLabel(line: DiffLine | null): string {
  if (!line) {
    return 'No line on this side';
  }
  const kind = line.kind === 'context' ? 'Context' : line.kind === 'added' ? 'Added' : 'Removed';
  const number = line.newLine ?? line.oldLine ?? '';
  return `${kind} line ${number}: ${line.text || 'blank'}`;
}

function createUnifiedLine(line: DiffLine, file: DiffFile, languageOverride: string | null | undefined): HTMLElement {
  const row = document.createElement('div');
  row.className = 'diff-line unified-line';
  row.dataset.kind = line.kind;
  row.dataset.lineId = line.id;
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', lineLabel(line));
  row.append(
    createLineNumber(line.oldLine, 'old'),
    createLineNumber(line.newLine, 'new'),
    createMarker(line),
    createCodeCell(line, file, languageOverride, 'unified'),
  );
  return row;
}

function pairedLines(lines: readonly DiffLine[]): SplitPair[] {
  const pairs: SplitPair[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line) {
      index += 1;
      continue;
    }
    if (line.kind === 'context') {
      pairs.push({ oldLine: line, newLine: line });
      index += 1;
      continue;
    }

    const removed: DiffLine[] = [];
    while (lines[index]?.kind === 'removed') {
      const removedLine = lines[index];
      if (removedLine) removed.push(removedLine);
      index += 1;
    }
    const added: DiffLine[] = [];
    while (lines[index]?.kind === 'added') {
      const addedLine = lines[index];
      if (addedLine) added.push(addedLine);
      index += 1;
    }
    const length = Math.max(removed.length, added.length);
    for (let pairIndex = 0; pairIndex < length; pairIndex += 1) {
      pairs.push({ oldLine: removed[pairIndex] ?? null, newLine: added[pairIndex] ?? null });
    }
  }
  return pairs;
}

function createSplitSide(line: DiffLine | null, file: DiffFile, languageOverride: string | null | undefined, side: 'old' | 'new'): HTMLElement {
  const element = document.createElement('div');
  element.className = 'split-side';
  element.dataset.side = side;
  element.dataset.kind = line?.kind ?? 'empty';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', lineLabel(line));
  element.append(
    createLineNumber(line?.[side === 'old' ? 'oldLine' : 'newLine'] ?? null, side),
    createMarker(line),
    createCodeCell(line, file, languageOverride, side),
  );
  return element;
}

function createSplitLine(pair: SplitPair, file: DiffFile, languageOverride: string | null | undefined): HTMLElement {
  const row = document.createElement('div');
  row.className = 'split-line';
  row.append(
    createSplitSide(pair.oldLine, file, languageOverride, 'old'),
    createSplitSide(pair.newLine, file, languageOverride, 'new'),
  );
  return row;
}

function createHunk(hunk: DiffHunk, file: DiffFile, options: DiffRenderOptions): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hunk';
  section.id = hunk.id;
  section.setAttribute('aria-labelledby', `${hunk.id}-heading`);

  const heading = document.createElement('header');
  heading.className = 'hunk-header';
  heading.id = `${hunk.id}-heading`;
  const marker = document.createElement('span');
  marker.className = 'hunk-marker';
  marker.textContent = '@@';
  const code = document.createElement('code');
  code.textContent = hunk.header;
  heading.append(marker, code);
  if (hunk.context) {
    const context = document.createElement('span');
    context.className = 'hunk-context';
    context.textContent = hunk.context;
    heading.append(context);
  }
  section.append(heading);
  appendWarningList(section, hunk.warnings);

  const lines = document.createElement('div');
  lines.className = 'diff-lines';
  lines.dataset.view = options.view;
  lines.dataset.wrap = String(options.wrap);
  lines.setAttribute('role', 'list');
  lines.setAttribute('aria-label', `${hunk.header} changed lines`);

  const unified = document.createElement('div');
  unified.className = 'unified-lines';
  unified.setAttribute('role', 'presentation');
  const unifiedLabels = document.createElement('div');
  unifiedLabels.className = 'unified-labels';
  const oldLabel = document.createElement('span');
  oldLabel.textContent = options.oldLabel;
  const newLabel = document.createElement('span');
  newLabel.textContent = options.newLabel;
  const codeLabel = document.createElement('span');
  codeLabel.textContent = 'Code';
  unifiedLabels.append(document.createElement('span'), oldLabel, newLabel, codeLabel);
  unified.append(unifiedLabels);
  for (const line of hunk.lines) {
    unified.append(createUnifiedLine(line, file, options.languageOverride));
  }
  lines.append(unified);

  if (options.view === 'split') {
    const mobileNote = document.createElement('p');
    mobileNote.className = 'mobile-split-note';
    mobileNote.textContent = 'Split view switches to unified on narrow screens.';
    lines.append(mobileNote);

    const split = document.createElement('div');
    split.className = 'split-lines';
    split.setAttribute('role', 'presentation');
    const splitHeader = document.createElement('div');
    splitHeader.className = 'split-labels';
    const oldLabel = document.createElement('span');
    oldLabel.textContent = options.oldLabel;
    const newLabel = document.createElement('span');
    newLabel.textContent = options.newLabel;
    splitHeader.append(oldLabel, newLabel);
    split.append(splitHeader);
    for (const pair of pairedLines(hunk.lines)) {
      split.append(createSplitLine(pair, file, options.languageOverride));
    }
    lines.append(split);
  }

  section.append(lines);
  return section;
}

function createFile(file: DiffFile, options: DiffRenderOptions): HTMLElement {
  const collapsed = options.collapsedFiles.has(file.id);
  const section = document.createElement('section');
  section.className = 'file-card';
  section.id = file.id;
  section.dataset.status = file.status;
  section.setAttribute('aria-labelledby', `${file.id}-heading`);

  const header = createFileHeading(file, collapsed);
  header.id = `${file.id}-heading`;
  section.append(header);

  if (!collapsed) {
    const body = document.createElement('div');
    body.className = 'file-body';
    body.id = `${file.id}-body`;
    appendWarningList(body, file.warnings);

    if (file.binary || file.status === 'binary') {
      body.append(createState('Binary file', 'This change has no textual hunks to render inline.', 'warning'));
    } else if (file.status === 'unsupported') {
      body.append(createState('Unsupported merge diff', 'Combined and conflict diff formats need a two-parent renderer.', 'warning'));
    } else if (file.hunks.length === 0) {
      body.append(createState('No textual hunks', 'Git recorded file metadata for this change, but no inline patch was supplied.', 'empty'));
    } else {
      const hunkList = document.createElement('div');
      hunkList.className = 'hunk-list';
      for (const hunk of file.hunks) {
        hunkList.append(createHunk(hunk, file, options));
      }
      body.append(hunkList);
    }
    section.append(body);
  }

  return section;
}

function createDocumentState(diff: DiffDocument): HTMLElement | null {
  if (diff.error) {
    return createState('Unable to read this patch', diff.error, 'error');
  }
  if (diff.files.length === 0) {
    return createState('No changes to display', 'The input is empty or contains identical text.', 'empty');
  }
  return null;
}

export function renderDiffBody(
  container: HTMLElement,
  diff: DiffDocument,
  options: DiffRenderOptions,
): DiffRenderResult {
  container.replaceChildren();
  const state = createDocumentState(diff);
  if (state) {
    container.append(state);
    return { fileElements: new Map(), renderedLines: 0 };
  }

  const layout = document.createElement('div');
  layout.className = 'review-layout';
  layout.append(createFileNavigation(diff.files));

  const files = document.createElement('div');
  files.className = 'file-list';
  const fileElements = new Map<string, HTMLElement>();
  let renderedLines = 0;
  for (const file of diff.files) {
    const element = createFile(file, options);
    fileElements.set(file.id, element);
    renderedLines += file.hunks.reduce((total, hunk) => total + hunk.lines.length, 0);
    files.append(element);
  }
  layout.append(files);
  container.append(layout);
  return { fileElements, renderedLines };
}
