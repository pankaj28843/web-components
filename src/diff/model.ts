import { diffLines, diffWordsWithSpace } from 'diff';
import type { Change } from 'diff';

export type DiffRowKind = 'context' | 'added' | 'removed' | 'modified';
export type DiffLineKind = 'context' | 'added' | 'removed';
export type DiffFileStatus = 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'binary' | 'unsupported';

export interface WordSegment {
  kind: 'equal' | 'added' | 'removed';
  text: string;
}

export interface DiffRow {
  id: string;
  kind: DiffRowKind;
  oldLine: number | null;
  newLine: number | null;
  oldText: string | null;
  newText: string | null;
  fileId?: string;
  hunkId?: string;
  words?: WordSegment[];
}

export interface DiffLine {
  id: string;
  kind: DiffLineKind;
  oldLine: number | null;
  newLine: number | null;
  text: string;
  noNewlineAtEnd: boolean;
}

export interface DiffHunk {
  id: string;
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  context: string;
  lines: DiffLine[];
  warnings: string[];
}

export interface DiffFile {
  id: string;
  path: string;
  oldPath: string | null;
  newPath: string | null;
  status: DiffFileStatus;
  oldMode: string | null;
  newMode: string | null;
  indexOld: string | null;
  indexNew: string | null;
  indexMode: string | null;
  similarity: number | null;
  dissimilarity: number | null;
  binary: boolean;
  noNewlineAtEnd: boolean;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
  warnings: string[];
}

export interface DiffStats {
  added: number;
  removed: number;
  changed: number;
  oldLines: number;
  newLines: number;
  files: number;
  hunks: number;
}

export interface DiffDocument {
  source: 'texts' | 'unified';
  oldText: string;
  newText: string;
  files: DiffFile[];
  rows: DiffRow[];
  stats: DiffStats;
  warnings: string[];
  error?: string;
}

interface LineChunk {
  kind: DiffLineKind;
  lines: string[];
}

interface ParsedPathPair {
  oldPath: string | null;
  newPath: string | null;
}

interface MutablePosition {
  oldLine: number;
  newLine: number;
}

function normalizeText(value: string): string {
  return value.replace(/\r\n?/g, '\n');
}

function splitLines(value: string): string[] {
  const normalized = normalizeText(value);
  if (normalized.length === 0) {
    return [];
  }

  const lines = normalized.split('\n');
  if (lines.at(-1) === '') {
    lines.pop();
  }
  return lines;
}

function changesToChunks(changes: Change[]): LineChunk[] {
  return changes.map((change): LineChunk => {
    const kind: DiffLineKind = change.added ? 'added' : change.removed ? 'removed' : 'context';
    return { kind, lines: splitLines(change.value) };
  }).filter((chunk) => chunk.lines.length > 0);
}

function segmentsForWords(oldText: string, newText: string): WordSegment[] {
  return diffWordsWithSpace(oldText, newText).map((change) => ({
    kind: change.added ? 'added' : change.removed ? 'removed' : 'equal',
    text: change.value,
  }));
}

function makeRow(
  index: number,
  kind: DiffRowKind,
  oldLine: number | null,
  newLine: number | null,
  oldText: string | null,
  newText: string | null,
  fileId?: string,
  hunkId?: string,
): DiffRow {
  return {
    id: `row-${index + 1}`,
    kind,
    oldLine,
    newLine,
    oldText,
    newText,
    ...(fileId === undefined ? {} : { fileId }),
    ...(hunkId === undefined ? {} : { hunkId }),
    ...(kind === 'modified' && oldText !== null && newText !== null
      ? { words: segmentsForWords(oldText, newText) }
      : {}),
  };
}

function emptyStats(): DiffStats {
  return { added: 0, removed: 0, changed: 0, oldLines: 0, newLines: 0, files: 0, hunks: 0 };
}

function statsForRows(rows: DiffRow[], oldLines: number, newLines: number, files = 0, hunks = 0): DiffStats {
  const added = rows.filter((row) => row.kind === 'added' || row.kind === 'modified').length;
  const removed = rows.filter((row) => row.kind === 'removed' || row.kind === 'modified').length;

  return {
    added,
    removed,
    changed: added + removed,
    oldLines,
    newLines,
    files,
    hunks,
  };
}

function pairChunks(chunks: LineChunk[], oldLineStart = 1, newLineStart = 1): DiffRow[] {
  const rows: DiffRow[] = [];
  let oldLine = oldLineStart;
  let newLine = newLineStart;
  let rowIndex = 0;

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    if (!chunk) {
      continue;
    }

    if (chunk.kind === 'context') {
      for (const text of chunk.lines) {
        rows.push(makeRow(rowIndex, 'context', oldLine, newLine, text, text));
        rowIndex += 1;
        oldLine += 1;
        newLine += 1;
      }
      continue;
    }

    const next = chunks[index + 1];
    if (next && ((chunk.kind === 'removed' && next.kind === 'added') || (chunk.kind === 'added' && next.kind === 'removed'))) {
      const removed = chunk.kind === 'removed' ? chunk : next;
      const added = chunk.kind === 'added' ? chunk : next;
      const pairs = Math.min(removed.lines.length, added.lines.length);

      for (let pairIndex = 0; pairIndex < pairs; pairIndex += 1) {
        const oldText = removed.lines[pairIndex] ?? '';
        const newText = added.lines[pairIndex] ?? '';
        rows.push(makeRow(rowIndex, 'modified', oldLine, newLine, oldText, newText));
        rowIndex += 1;
        oldLine += 1;
        newLine += 1;
      }

      for (const text of removed.lines.slice(pairs)) {
        rows.push(makeRow(rowIndex, 'removed', oldLine, null, text, null));
        rowIndex += 1;
        oldLine += 1;
      }
      for (const text of added.lines.slice(pairs)) {
        rows.push(makeRow(rowIndex, 'added', null, newLine, null, text));
        rowIndex += 1;
        newLine += 1;
      }
      index += 1;
      continue;
    }

    if (chunk.kind === 'removed') {
      for (const text of chunk.lines) {
        rows.push(makeRow(rowIndex, 'removed', oldLine, null, text, null));
        rowIndex += 1;
        oldLine += 1;
      }
    } else {
      for (const text of chunk.lines) {
        rows.push(makeRow(rowIndex, 'added', null, newLine, null, text));
        rowIndex += 1;
        newLine += 1;
      }
    }
  }

  return rows;
}

function createLine(id: string, kind: DiffLineKind, oldLine: number | null, newLine: number | null, text: string): DiffLine {
  return { id, kind, oldLine, newLine, text, noNewlineAtEnd: false };
}

function createHunk(
  id: string,
  header: string,
  oldStart: number,
  oldCount: number,
  newStart: number,
  newCount: number,
  context: string,
): DiffHunk {
  return { id, header, oldStart, oldCount, newStart, newCount, context, lines: [], warnings: [] };
}

function createFile(id: string, paths: ParsedPathPair, status: DiffFileStatus = 'modified'): DiffFile {
  return {
    id,
    path: paths.newPath ?? paths.oldPath ?? '(unknown path)',
    oldPath: paths.oldPath,
    newPath: paths.newPath,
    status,
    oldMode: null,
    newMode: null,
    indexOld: null,
    indexNew: null,
    indexMode: null,
    similarity: null,
    dissimilarity: null,
    binary: false,
    noNewlineAtEnd: false,
    additions: 0,
    deletions: 0,
    hunks: [],
    warnings: [],
  };
}

function unquoteGitPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
    return trimmed;
  }

  const body = trimmed.slice(1, -1);
  return body.replace(/\\(\\|"|t|n|r|[0-7]{3})/g, (_match, escaped: string) => {
    if (escaped === '\\') return '\\';
    if (escaped === '"') return '"';
    if (escaped === 't') return '\t';
    if (escaped === 'n') return '\n';
    if (escaped === 'r') return '\r';
    return String.fromCharCode(Number.parseInt(escaped, 8));
  });
}

function stripGitPrefix(path: string | null, prefix: 'a' | 'b'): string | null {
  if (path === null || path === '/dev/null') {
    return null;
  }
  const normalized = unquoteGitPath(path);
  return normalized.startsWith(`${prefix}/`) ? normalized.slice(2) : normalized;
}

function readPathToken(value: string, start: number): { value: string; next: number } | null {
  let index = start;
  while (index < value.length && /\s/.test(value[index] ?? '')) {
    index += 1;
  }
  if (index >= value.length) {
    return null;
  }

  if (value[index] === '"') {
    const begin = index;
    index += 1;
    let escaped = false;
    while (index < value.length) {
      const character = value[index];
      index += 1;
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        return { value: value.slice(begin, index), next: index };
      }
    }
    return { value: value.slice(begin), next: index };
  }

  const begin = index;
  while (index < value.length && !/\s/.test(value[index] ?? '')) {
    index += 1;
  }
  return { value: value.slice(begin, index), next: index };
}

function parseGitHeaderPaths(value: string): ParsedPathPair {
  const first = readPathToken(value, 0);
  const second = first ? readPathToken(value, first.next) : null;
  if (first && second) {
    return {
      oldPath: stripGitPrefix(first.value, 'a'),
      newPath: stripGitPrefix(second.value, 'b'),
    };
  }

  const boundary = value.lastIndexOf(' b/');
  if (boundary > 0) {
    return {
      oldPath: stripGitPrefix(value.slice(0, boundary), 'a'),
      newPath: stripGitPrefix(value.slice(boundary + 1), 'b'),
    };
  }

  return { oldPath: null, newPath: null };
}

function parseTraditionalPath(line: string, prefix: 'a' | 'b'): string | null {
  const raw = line.slice(4).split('\t', 1)[0] ?? '';
  return stripGitPrefix(raw, prefix);
}

function parseHunkHeader(value: string): { oldStart: number; oldCount: number; newStart: number; newCount: number; context: string } | null {
  const match = value.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?: ?(.*))?$/);
  if (!match) {
    return null;
  }

  return {
    oldStart: Number(match[1]),
    oldCount: Number(match[2] ?? 1),
    newStart: Number(match[3]),
    newCount: Number(match[4] ?? 1),
    context: match[5] ?? '',
  };
}

function parseCombinedHeader(value: string): string | null {
  const match = value.match(/^diff --(?:cc|combined)\s+(.+)$/);
  return match?.[1] ? unquoteGitPath(match[1]) : null;
}

function parseIndexHeader(value: string): { oldHash: string | null; newHash: string | null; mode: string | null } {
  const match = value.match(/^index\s+([^.\s]+)\.\.([^\s]+)(?:\s+(\d{6}))?$/);
  return {
    oldHash: match?.[1] ?? null,
    newHash: match?.[2] ?? null,
    mode: match?.[3] ?? null,
  };
}

function parsePercent(value: string, label: string): number | null {
  const match = value.match(new RegExp(`^${label} (\\d+)%$`));
  return match?.[1] ? Number(match[1]) : null;
}

function addWarning(file: DiffFile, message: string, hunk?: DiffHunk): void {
  if (!file.warnings.includes(message)) {
    file.warnings.push(message);
  }
  if (hunk && !hunk.warnings.includes(message)) {
    hunk.warnings.push(message);
  }
}

function finalizeHunk(file: DiffFile, hunk: DiffHunk | null): void {
  if (!hunk) {
    return;
  }
  const oldConsumed = hunk.lines.filter((line) => line.kind !== 'added').length;
  const newConsumed = hunk.lines.filter((line) => line.kind !== 'removed').length;
  if (oldConsumed !== hunk.oldCount || newConsumed !== hunk.newCount) {
    addWarning(
      file,
      `Hunk ${hunk.header} range declares ${hunk.oldCount}/${hunk.newCount} lines but contains ${oldConsumed}/${newConsumed}.`,
      hunk,
    );
  }
}

function finalizeFile(file: DiffFile): void {
  file.path = file.newPath ?? file.oldPath ?? '(unknown path)';
  if (file.status === 'modified') {
    if (file.oldPath === null && file.newPath !== null) {
      file.status = 'added';
    } else if (file.newPath === null && file.oldPath !== null) {
      file.status = 'deleted';
    }
  }
  if (file.binary && file.status === 'modified') {
    file.status = 'binary';
  }
  file.additions = file.hunks.reduce((total, hunk) => total + hunk.lines.filter((line) => line.kind === 'added').length, 0);
  file.deletions = file.hunks.reduce((total, hunk) => total + hunk.lines.filter((line) => line.kind === 'removed').length, 0);
}

function createRowsFromFiles(files: DiffFile[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let rowIndex = 0;

  for (const file of files) {
    for (const hunk of file.hunks) {
      let index = 0;
      while (index < hunk.lines.length) {
        const line = hunk.lines[index];
        if (!line) {
          index += 1;
          continue;
        }

        if (line.kind === 'removed') {
          const removed: DiffLine[] = [];
          while (hunk.lines[index]?.kind === 'removed') {
            const removedLine = hunk.lines[index];
            if (removedLine) removed.push(removedLine);
            index += 1;
          }
          const added: DiffLine[] = [];
          while (hunk.lines[index]?.kind === 'added') {
            const addedLine = hunk.lines[index];
            if (addedLine) added.push(addedLine);
            index += 1;
          }
          const pairs = Math.min(removed.length, added.length);
          for (let pair = 0; pair < pairs; pair += 1) {
            const oldLine = removed[pair];
            const newLine = added[pair];
            if (oldLine && newLine) {
              rows.push(makeRow(rowIndex, 'modified', oldLine.oldLine, newLine.newLine, oldLine.text, newLine.text, file.id, hunk.id));
              rowIndex += 1;
            }
          }
          for (const removedLine of removed.slice(pairs)) {
            rows.push(makeRow(rowIndex, 'removed', removedLine.oldLine, null, removedLine.text, null, file.id, hunk.id));
            rowIndex += 1;
          }
          for (const addedLine of added.slice(pairs)) {
            rows.push(makeRow(rowIndex, 'added', null, addedLine.newLine, null, addedLine.text, file.id, hunk.id));
            rowIndex += 1;
          }
          continue;
        }

        rows.push(makeRow(
          rowIndex,
          line.kind,
          line.oldLine,
          line.newLine,
          line.kind === 'added' ? null : line.text,
          line.text,
          file.id,
          hunk.id,
        ));
        rowIndex += 1;
        index += 1;
      }
    }
  }

  return rows;
}

function statsForFiles(files: DiffFile[]): DiffStats {
  const added = files.reduce((total, file) => total + file.additions, 0);
  const removed = files.reduce((total, file) => total + file.deletions, 0);
  const oldLines = files.reduce((total, file) => total + file.hunks.reduce((hunkTotal, hunk) => hunkTotal + hunk.lines.filter((line) => line.kind !== 'added').length, 0), 0);
  const newLines = files.reduce((total, file) => total + file.hunks.reduce((hunkTotal, hunk) => hunkTotal + hunk.lines.filter((line) => line.kind !== 'removed').length, 0), 0);
  const hunks = files.reduce((total, file) => total + file.hunks.length, 0);
  return { added, removed, changed: added + removed, oldLines, newLines, files: files.length, hunks };
}

function textFromFiles(files: DiffFile[], side: 'old' | 'new'): string {
  const lines: string[] = [];
  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (side === 'old' && line.kind !== 'added') lines.push(line.text);
        if (side === 'new' && line.kind !== 'removed') lines.push(line.text);
      }
    }
  }
  return lines.join('\n');
}

export function createDiff(oldText: string, newText: string): DiffDocument {
  const normalizedOld = normalizeText(oldText);
  const normalizedNew = normalizeText(newText);
  const oldLines = splitLines(normalizedOld);
  const newLines = splitLines(normalizedNew);
  const chunks = changesToChunks(diffLines(normalizedOld, normalizedNew));
  const rows = pairChunks(chunks);
  const lines: DiffLine[] = [];
  let lineIndex = 0;
  for (const row of rows) {
    if (row.kind === 'modified') {
      lines.push(createLine(`text-line-${lineIndex += 1}`, 'removed', row.oldLine, null, row.oldText ?? ''));
      lines.push(createLine(`text-line-${lineIndex += 1}`, 'added', null, row.newLine, row.newText ?? ''));
    } else if (row.kind === 'context') {
      lines.push(createLine(`text-line-${lineIndex += 1}`, 'context', row.oldLine, row.newLine, row.oldText ?? ''));
    } else if (row.kind === 'removed') {
      lines.push(createLine(`text-line-${lineIndex += 1}`, 'removed', row.oldLine, null, row.oldText ?? ''));
    } else {
      lines.push(createLine(`text-line-${lineIndex += 1}`, 'added', null, row.newLine, row.newText ?? ''));
    }
  }
  const hunk = createHunk('text-hunk-1', `@@ -1,${oldLines.length} +1,${newLines.length} @@`, 1, oldLines.length, 1, newLines.length, '');
  hunk.lines = lines;
  const file = createFile('text-file-1', { oldPath: '(old text)', newPath: '(new text)' });
  file.hunks = rows.length > 0 ? [hunk] : [];
  finalizeFile(file);
  const files = rows.length > 0 ? [file] : [];

  return {
    source: 'texts',
    oldText: normalizedOld,
    newText: normalizedNew,
    files,
    rows,
    stats: statsForRows(rows, oldLines.length, newLines.length, rows.length > 0 ? 1 : 0, rows.length > 0 ? 1 : 0),
    warnings: [],
  };
}

export function parseUnifiedDiff(patch: string): DiffDocument {
  const normalized = normalizeText(patch);
  const lines = normalized.split('\n');
  if (lines.at(-1) === '') {
    lines.pop();
  }

  const files: DiffFile[] = [];
  const warnings: string[] = [];
  let current: DiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let position: MutablePosition | null = null;
  let fileIndex = 0;
  let hunkIndex = 0;

  const finishHunk = (): void => {
    if (current) finalizeHunk(current, hunk);
    hunk = null;
    position = null;
  };
  const finishFile = (): void => {
    finishHunk();
    if (current) {
      finalizeFile(current);
      files.push(current);
    }
    current = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (line.startsWith('diff --git ')) {
      finishFile();
      fileIndex += 1;
      current = createFile(`file-${fileIndex}`, parseGitHeaderPaths(line.slice('diff --git '.length)));
      continue;
    }

    const combinedPath = parseCombinedHeader(line);
    if (combinedPath !== null) {
      finishFile();
      fileIndex += 1;
      current = createFile(`file-${fileIndex}`, { oldPath: combinedPath, newPath: combinedPath }, 'unsupported');
      addWarning(current, 'Unsupported combined merge diff; the two-way renderer cannot display it.');
      continue;
    }

    if (!current && line.startsWith('--- ')) {
      const oldPath = parseTraditionalPath(line, 'a');
      const nextLine = lines[index + 1] ?? '';
      const newPath = nextLine.startsWith('+++ ') ? parseTraditionalPath(nextLine, 'b') : oldPath;
      fileIndex += 1;
      current = createFile(`file-${fileIndex}`, { oldPath, newPath });
    }

    if (!current) {
      continue;
    }

    const parsedHunk = parseHunkHeader(line);
    if (parsedHunk) {
      finishHunk();
      hunkIndex += 1;
      hunk = createHunk(
        `hunk-${hunkIndex}`,
        line,
        parsedHunk.oldStart,
        parsedHunk.oldCount,
        parsedHunk.newStart,
        parsedHunk.newCount,
        parsedHunk.context,
      );
      current.hunks.push(hunk);
      position = { oldLine: parsedHunk.oldStart, newLine: parsedHunk.newStart };
      continue;
    }

    if (line === '\\ No newline at end of file') {
      current.noNewlineAtEnd = true;
      const previous = hunk?.lines.at(-1);
      if (previous) previous.noNewlineAtEnd = true;
      continue;
    }

    if (hunk && position && (line.startsWith(' ') || line.startsWith('-') || line.startsWith('+'))) {
      const marker = line[0];
      const text = line.slice(1);
      if (marker === ' ') {
        hunk.lines.push(createLine(`${hunk.id}-line-${hunk.lines.length + 1}`, 'context', position.oldLine, position.newLine, text));
        position.oldLine += 1;
        position.newLine += 1;
      } else if (marker === '-') {
        hunk.lines.push(createLine(`${hunk.id}-line-${hunk.lines.length + 1}`, 'removed', position.oldLine, null, text));
        position.oldLine += 1;
      } else {
        hunk.lines.push(createLine(`${hunk.id}-line-${hunk.lines.length + 1}`, 'added', null, position.newLine, text));
        position.newLine += 1;
      }
      continue;
    }

    if (line.startsWith('old mode ')) {
      current.oldMode = line.slice('old mode '.length).trim();
    } else if (line.startsWith('new mode ')) {
      current.newMode = line.slice('new mode '.length).trim();
    } else if (line.startsWith('deleted file mode ')) {
      current.status = 'deleted';
      current.oldMode = line.slice('deleted file mode '.length).trim();
      current.newPath = null;
    } else if (line.startsWith('new file mode ')) {
      current.status = 'added';
      current.newMode = line.slice('new file mode '.length).trim();
      current.oldPath = null;
    } else if (line.startsWith('rename from ')) {
      current.status = 'renamed';
      current.oldPath = unquoteGitPath(line.slice('rename from '.length));
    } else if (line.startsWith('rename to ')) {
      current.status = 'renamed';
      current.newPath = unquoteGitPath(line.slice('rename to '.length));
    } else if (line.startsWith('copy from ')) {
      current.status = 'copied';
      current.oldPath = unquoteGitPath(line.slice('copy from '.length));
    } else if (line.startsWith('copy to ')) {
      current.status = 'copied';
      current.newPath = unquoteGitPath(line.slice('copy to '.length));
    } else if (line.startsWith('similarity index ')) {
      current.similarity = parsePercent(line, 'similarity index');
    } else if (line.startsWith('dissimilarity index ')) {
      current.dissimilarity = parsePercent(line, 'dissimilarity index');
    } else if (line.startsWith('index ')) {
      const parsedIndex = parseIndexHeader(line);
      current.indexOld = parsedIndex.oldHash;
      current.indexNew = parsedIndex.newHash;
      current.indexMode = parsedIndex.mode;
    } else if (line.startsWith('--- ')) {
      current.oldPath = parseTraditionalPath(line, 'a');
      if (current.oldPath === null && current.status === 'modified') current.status = 'added';
    } else if (line.startsWith('+++ ')) {
      current.newPath = parseTraditionalPath(line, 'b');
      if (current.newPath === null && current.status === 'modified') current.status = 'deleted';
    } else if (line === 'GIT binary patch' || line.startsWith('Binary files ')) {
      current.binary = true;
      addWarning(current, `Binary content is not rendered inline: ${line}`);
    } else if (line.startsWith('literal ') || line.startsWith('delta ')) {
      current.binary = true;
    } else if (hunk) {
      addWarning(current, `Unrecognized line inside hunk: ${line.slice(0, 80)}`, hunk);
    }
  }
  finishFile();

  for (const file of files) {
    if (file.warnings.length > 0) warnings.push(...file.warnings.map((warning) => `${file.path}: ${warning}`));
  }

  if (patch.trim().length > 0 && files.length === 0) {
    return {
      source: 'unified',
      oldText: '',
      newText: '',
      files: [],
      rows: [],
      stats: emptyStats(),
      warnings,
      error: 'The supplied text is not a unified diff with a readable file boundary.',
    };
  }

  const rows = createRowsFromFiles(files);
  return {
    source: 'unified',
    oldText: textFromFiles(files, 'old'),
    newText: textFromFiles(files, 'new'),
    files,
    rows,
    stats: statsForFiles(files),
    warnings,
  };
}
