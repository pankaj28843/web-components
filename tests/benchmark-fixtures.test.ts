import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseUnifiedDiff } from '../src/diff/model';

interface BenchmarkFixture {
  id: string;
  files: number;
  diffHeaders: number;
  hunks: number;
  diff: string;
  filesOracle: string;
}

interface BenchmarkManifest {
  fixtures: BenchmarkFixture[];
}

interface OracleFile {
  status: string;
  filename: string;
  patch?: string | null;
}

const benchmarkRoot = process.env.DIFF_BENCHMARK_ROOT;

describe.skipIf(!benchmarkRoot)('GitHub diff benchmark corpus', () => {
  it('preserves every final API file boundary and patch state', () => {
    if (!benchmarkRoot) {
      return;
    }

    const manifest = JSON.parse(readFileSync(join(benchmarkRoot, 'manifest.json'), 'utf8')) as BenchmarkManifest;
    expect(manifest.fixtures).toHaveLength(20);

    for (const fixture of manifest.fixtures) {
      const diff = parseUnifiedDiff(readFileSync(join(benchmarkRoot, fixture.diff), 'utf8'));
      const oracle = JSON.parse(readFileSync(join(benchmarkRoot, fixture.filesOracle), 'utf8')) as OracleFile[];

      expect(diff.error, `${fixture.id} should parse`).toBeUndefined();
      expect(diff.files, fixture.id).toHaveLength(fixture.files);
      expect(diff.files.filter((file) => file.id.startsWith('file-'))).toHaveLength(fixture.diffHeaders);
      expect(diff.stats.hunks, fixture.id).toBe(fixture.hunks);
      expect(oracle, `${fixture.id} API oracle`).toHaveLength(fixture.files);

      const oracleByPath = new Map(oracle.map((file) => [file.filename, file]));
      for (const file of diff.files) {
        expect(file.path, `${fixture.id} path`).not.toBe('(unknown path)');
        const expectedFile = oracleByPath.get(file.path);
        expect(expectedFile, `${fixture.id} missing API file ${file.path}`).toBeDefined();
        if (expectedFile) {
          const expectedStatus = expectedFile.status === 'removed' ? 'deleted' : expectedFile.status;
          const binaryStatusIsExpected = file.status === 'binary' && ['added', 'modified', 'deleted'].includes(expectedStatus);
          expect(file.status === expectedStatus || binaryStatusIsExpected, `${fixture.id} status for ${file.path}`).toBe(true);
        }
        for (const hunk of file.hunks) {
          expect(hunk.header, `${fixture.id} hunk`).toMatch(/^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/);
          for (const line of hunk.lines) {
            expect(['context', 'added', 'removed']).toContain(line.kind);
            expect(line.oldLine !== null || line.newLine !== null).toBe(true);
          }
        }
      }

      expect(new Set(diff.files.map((file) => file.path)).size, `${fixture.id} unique paths`).toBe(oracle.length);
    }
  });
});
