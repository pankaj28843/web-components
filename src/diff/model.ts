import { diffLines, diffWordsWithSpace } from 'diff';
import type { Change } from 'diff';

export type DiffRowKind = 'context' | 'added' | 'removed' | 'modified';

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
  words?: WordSegment[];
}

export interface DiffStats {
  added: number;
  removed: number;
  changed: number;
  oldLines: number;
  newLines: number;
}

export interface DiffDocument {
  source: 'texts' | 'unified';
  oldText: string;
  newText: string;
  rows: DiffRow[];
  stats: DiffStats;
  error?: string;
}

interface LineChunk {
  kind: 'context' | 'added' | 'removed';
  lines: string[];
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
    const kind: LineChunk['kind'] = change.added ? 'added' : change.removed ? 'removed' : 'context';
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
): DiffRow {
  return {
    id: `row-${index + 1}`,
    kind,
    oldLine,
    newLine,
    oldText,
    newText,
    ...(kind === 'modified' && oldText !== null && newText !== null
      ? { words: segmentsForWords(oldText, newText) }
      : {}),
  };
}

function statsForRows(rows: DiffRow[], oldLines: number, newLines: number): DiffStats {
  const added = rows.filter((row) => row.kind === 'added' || row.kind === 'modified').length;
  const removed = rows.filter((row) => row.kind === 'removed' || row.kind === 'modified').length;

  return {
    added,
    removed,
    changed: added + removed,
    oldLines,
    newLines,
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

export function createDiff(oldText: string, newText: string): DiffDocument {
  const normalizedOld = normalizeText(oldText);
  const normalizedNew = normalizeText(newText);
  const oldLines = splitLines(normalizedOld);
  const newLines = splitLines(normalizedNew);
  const chunks = changesToChunks(diffLines(normalizedOld, normalizedNew));
  const rows = pairChunks(chunks);

  return {
    source: 'texts',
    oldText: normalizedOld,
    newText: normalizedNew,
    rows,
    stats: statsForRows(rows, oldLines.length, newLines.length),
  };
}

interface HunkPosition {
  oldLine: number;
  newLine: number;
}

function parseHunkHeader(value: string): HunkPosition | null {
  const match = value.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
  if (!match) {
    return null;
  }

  return {
    oldLine: Number(match[1]),
    newLine: Number(match[3]),
  };
}

export function parseUnifiedDiff(patch: string): DiffDocument {
  const normalized = normalizeText(patch);
  const lines = normalized.split('\n');
  if (lines.at(-1) === '') {
    lines.pop();
  }

  const rows: DiffRow[] = [];
  const oldLines: string[] = [];
  const newLines: string[] = [];
  let position: HunkPosition | null = null;
  let rowIndex = 0;

  for (const line of lines) {
    const hunk = parseHunkHeader(line);
    if (hunk) {
      position = hunk;
      continue;
    }

    if (!position || line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ') || line === '\\ No newline at end of file') {
      continue;
    }

    const marker = line[0];
    const text = line.slice(1);
    if (marker === ' ') {
      rows.push(makeRow(rowIndex, 'context', position.oldLine, position.newLine, text, text));
      rowIndex += 1;
      oldLines.push(text);
      newLines.push(text);
      position.oldLine += 1;
      position.newLine += 1;
    } else if (marker === '-') {
      rows.push(makeRow(rowIndex, 'removed', position.oldLine, null, text, null));
      rowIndex += 1;
      oldLines.push(text);
      position.oldLine += 1;
    } else if (marker === '+') {
      const previous = rows.at(-1);
      if (previous?.kind === 'removed' && previous.newText === null) {
        rows[rows.length - 1] = makeRow(rowIndex - 1, 'modified', previous.oldLine, position.newLine, previous.oldText, text);
      } else {
        rows.push(makeRow(rowIndex, 'added', null, position.newLine, null, text));
        rowIndex += 1;
      }
      newLines.push(text);
      position.newLine += 1;
    }
  }

  if (patch.trim().length > 0 && rows.length === 0) {
    return {
      source: 'unified',
      oldText: '',
      newText: '',
      rows: [],
      stats: statsForRows([], 0, 0),
      error: 'The supplied text is not a unified diff with a readable hunk.',
    };
  }

  return {
    source: 'unified',
    oldText: oldLines.join('\n'),
    newText: newLines.join('\n'),
    rows,
    stats: statsForRows(rows, oldLines.length, newLines.length),
  };
}
