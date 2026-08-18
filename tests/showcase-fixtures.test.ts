import { describe, expect, it } from 'vitest';
import { parseUnifiedDiff } from '../src/diff/model';
import { pullRequestFixtures } from '../stories/fixtures';

describe('showcase pull request fixtures', () => {
  it('keeps every curated review input renderable as a multi-file patch', () => {
    const fixtures = Object.values(pullRequestFixtures);

    expect(fixtures).toHaveLength(6);

    for (const fixture of fixtures) {
      const document = parseUnifiedDiff(fixture.patch);

      expect(document.error, fixture.id).toBeUndefined();
      expect(document.files.length, fixture.id).toBeGreaterThanOrEqual(2);
      expect(document.stats.files, fixture.id).toBe(document.files.length);
      expect(document.stats.hunks, fixture.id).toBeGreaterThanOrEqual(2);
      expect(document.files.flatMap((file) => file.warnings), fixture.id).not.toEqual(
        expect.arrayContaining([expect.stringContaining('range')]),
      );
    }
  });
});
