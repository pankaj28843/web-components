import { describe, expect, it } from 'vitest';
import { parseUnifiedDiff } from '../src/diff/model';

describe('Git unified diff model', () => {
  it('preserves file boundaries, statuses, paths, hunk ranges, and line provenance', () => {
    const patch = [
      'diff --git a/src/old.ts b/src/new.ts',
      'similarity index 88%',
      'rename from src/old.ts',
      'rename to src/new.ts',
      'index 1111111..2222222 100644',
      '--- a/src/old.ts',
      '+++ b/src/new.ts',
      '@@ -1,2 +1,3 @@ function calculate()',
      ' const first = 1;',
      '-const value = 1;',
      '+const value = 2;',
      '+const extra = 3;',
      '\\ No newline at end of file',
      'diff --git a/config.json b/config.json',
      'new file mode 100644',
      'index 0000000..3333333',
      '--- /dev/null',
      '+++ b/config.json',
      '@@ -0,0 +1,2 @@',
      '+{"enabled": true}',
      '+{"mode": "safe"}',
      'diff --git a/removed.txt b/removed.txt',
      'deleted file mode 100644',
      'index 4444444..0000000',
      '--- a/removed.txt',
      '+++ /dev/null',
      '@@ -1,2 +0,0 @@',
      '-first',
      '-second',
    ].join('\n');

    const document = parseUnifiedDiff(patch);

    expect(document.error).toBeUndefined();
    expect(document.files).toHaveLength(3);
    expect(document.files.map((file) => [file.status, file.oldPath, file.newPath])).toEqual([
      ['renamed', 'src/old.ts', 'src/new.ts'],
      ['added', null, 'config.json'],
      ['deleted', 'removed.txt', null],
    ]);
    expect(document.files[0]?.similarity).toBe(88);
    expect(document.files[0]?.hunks[0]).toMatchObject({
      oldStart: 1,
      oldCount: 2,
      newStart: 1,
      newCount: 3,
      context: 'function calculate()',
    });
    expect(document.files[0]?.hunks[0]?.lines.map((line) => [line.kind, line.oldLine, line.newLine, line.text])).toEqual([
      ['context', 1, 1, 'const first = 1;'],
      ['removed', 2, null, 'const value = 1;'],
      ['added', null, 2, 'const value = 2;'],
      ['added', null, 3, 'const extra = 3;'],
    ]);
    expect(document.files[0]?.noNewlineAtEnd).toBe(true);
    expect(document.stats).toMatchObject({ added: 4, removed: 3, oldLines: 4, newLines: 5 });
  });

  it('keeps binary and mode-only files visible instead of dropping them', () => {
    const patch = [
      'diff --git a/assets/icon.png b/assets/icon.png',
      'old mode 100644',
      'new mode 100755',
      'Binary files a/assets/icon.png and b/assets/icon.png differ',
      'diff --git a/scripts/run.sh b/scripts/run.sh',
      'old mode 100644',
      'new mode 100755',
    ].join('\n');

    const document = parseUnifiedDiff(patch);

    expect(document.error).toBeUndefined();
    expect(document.files).toHaveLength(2);
    expect(document.files[0]).toMatchObject({
      status: 'binary',
      path: 'assets/icon.png',
      oldMode: '100644',
      newMode: '100755',
      binary: true,
    });
    expect(document.files[1]).toMatchObject({
      status: 'modified',
      path: 'scripts/run.sh',
      oldMode: '100644',
      newMode: '100755',
    });
    expect(document.files[0]?.warnings.join(' ')).toContain('Binary');
  });

  it('reports malformed ranges and combined diffs without pretending they are ordinary hunks', () => {
    const document = parseUnifiedDiff([
      'diff --git a/file.ts b/file.ts',
      '--- a/file.ts',
      '+++ b/file.ts',
      '@@ -1,3 +1,1 @@',
      '-one',
      '+two',
      'diff --cc merge.ts',
      'index 1111111,2222222..3333333',
      '@@@ -1,1 -1,1 +1,1 @@@',
      '++merged',
    ].join('\n'));

    expect(document.files).toHaveLength(2);
    expect(document.files[0]?.warnings.join(' ')).toContain('range');
    expect(document.files[1]).toMatchObject({ status: 'unsupported', binary: false });
    expect(document.files[1]?.warnings.join(' ')).toContain('combined');
  });

  it('rejects non-patch input with an actionable error', () => {
    const document = parseUnifiedDiff('this is not a patch');

    expect(document.error).toContain('not a unified diff');
    expect(document.files).toHaveLength(0);
  });
});
