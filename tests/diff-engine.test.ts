import { describe, expect, it } from 'vitest';
import { createDiff, parseUnifiedDiff } from '../src/diff/model';

describe('createDiff', () => {
  it('normalizes newlines and keeps deterministic line provenance', () => {
    const diff = createDiff('one\r\ntwo\r\nthree\r\n', 'one\ntwo changed\nthree\nfour\n');

    expect(diff.oldText).toBe('one\ntwo\nthree\n');
    expect(diff.newText).toBe('one\ntwo changed\nthree\nfour\n');
    expect(diff.rows.map((row) => [row.kind, row.oldLine, row.newLine])).toEqual([
      ['context', 1, 1],
      ['modified', 2, 2],
      ['context', 3, 3],
      ['added', null, 4],
    ]);
    expect(diff.stats).toMatchObject({ added: 2, removed: 1, changed: 3, oldLines: 3, newLines: 4 });
  });

  it('represents an identical empty document as a valid empty diff', () => {
    const diff = createDiff('', '');

    expect(diff.error).toBeUndefined();
    expect(diff.rows).toHaveLength(0);
    expect(diff.stats).toMatchObject({ added: 0, removed: 0, changed: 0 });
  });
});

describe('parseUnifiedDiff', () => {
  it('parses hunks and pairs adjacent removals/additions', () => {
    const diff = parseUnifiedDiff([
      'diff --git a/file.ts b/file.ts',
      '--- a/file.ts',
      '+++ b/file.ts',
      '@@ -1,3 +1,4 @@',
      ' const before = true;',
      '-const value = 1;',
      '+const value = 2;',
      '+const extra = 3;',
      ' const after = true;',
    ].join('\n'));

    expect(diff.error).toBeUndefined();
    expect(diff.rows.map((row) => [row.kind, row.oldLine, row.newLine, row.oldText, row.newText])).toEqual([
      ['context', 1, 1, 'const before = true;', 'const before = true;'],
      ['modified', 2, 2, 'const value = 1;', 'const value = 2;'],
      ['added', null, 3, null, 'const extra = 3;'],
      ['context', 3, 4, 'const after = true;', 'const after = true;'],
    ]);
    expect(diff.stats).toMatchObject({ added: 2, removed: 1, oldLines: 3, newLines: 4 });
  });

  it('returns an actionable error for non-patch input', () => {
    const diff = parseUnifiedDiff('this is not a patch');

    expect(diff.error).toContain('not a unified diff');
  });
});
