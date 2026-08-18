/* global console, process */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = join(process.cwd(), 'storybook-static');
const requiredFiles = ['index.html', 'iframe.html', 'index.json'];
const missingFiles = requiredFiles.filter((file) => !existsSync(join(outputDir, file)));

if (missingFiles.length > 0) {
  console.error(`Storybook output is missing: ${missingFiles.join(', ')}`);
  process.exit(1);
}

const index = readFileSync(join(outputDir, 'index.html'), 'utf8');
const iframe = readFileSync(join(outputDir, 'iframe.html'), 'utf8');
const storyIndex = JSON.parse(readFileSync(join(outputDir, 'index.json'), 'utf8'));
const requiredTitles = (process.env.STORYBOOK_REQUIRED_TITLES ?? '')
  .split('|')
  .map((title) => title.trim())
  .filter(Boolean);
const requiredNames = (process.env.STORYBOOK_REQUIRED_NAMES ?? '')
  .split('|')
  .map((name) => name.trim())
  .filter(Boolean);
const entries = Object.values(storyIndex.entries ?? {});
const entryTitles = new Set(entries.map((entry) => entry.title));
const entryNames = new Set(entries.map((entry) => entry.name));
const missingTitles = requiredTitles.filter((title) => !entryTitles.has(title));
const missingNames = requiredNames.filter((name) => !entryNames.has(name));
const forbiddenRootReferences = [...index.matchAll(/(?:src|href)=["']\/(?!web-components\/)/g), ...iframe.matchAll(/(?:src|href)=["']\/(?!web-components\/)/g)];

if (missingTitles.length > 0) {
  console.error(`Storybook output is missing required titles: ${missingTitles.join(', ')}`);
  process.exit(1);
}

if (missingNames.length > 0) {
  console.error(`Storybook output is missing required stories: ${missingNames.join(', ')}`);
  process.exit(1);
}

if (forbiddenRootReferences.length > 0 || /\/src\//.test(`${index}\n${iframe}`)) {
  console.error('Storybook output contains an unresolved root-relative source reference.');
  process.exit(1);
}

if (!iframe.includes('/web-components/')) {
  console.error('Storybook iframe does not contain the repository project path.');
  process.exit(1);
}

console.log(`Storybook build checked: ${entries.length} stories, project path /web-components/.`);
