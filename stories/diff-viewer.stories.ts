import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { DiffViewerElement } from '../src/components/diff-viewer';
import '../src/share';
import './showcase.css';
import { pullRequestFixtures, type PullRequestFixture } from './fixtures';

type Theme = 'light' | 'dark';
type ViewMode = 'unified' | 'split';

interface ViewerStoryArgs {
  storyTitle: string;
  note: string;
  sourceUrl?: string;
  sourceLabel?: string;
  theme: Theme;
  view: ViewMode;
  wrap: boolean;
  language: string;
  title: string;
  oldLabel: string;
  newLabel: string;
  diffText: string;
  oldText: string;
  newText: string;
}

function createFixtureArgs(fixture: PullRequestFixture, theme: Theme = 'light'): ViewerStoryArgs {
  return {
    storyTitle: `${fixture.repository}#${fixture.number}`,
    note: `${fixture.title}. ${fixture.role}. ${fixture.discussion}`,
    sourceUrl: fixture.url,
    sourceLabel: `Open ${fixture.repository}#${fixture.number}`,
    theme,
    view: 'unified',
    wrap: false,
    language: fixture.language,
    title: `${fixture.repository} · PR #${fixture.number}`,
    oldLabel: 'Base',
    newLabel: 'PR head',
    diffText: fixture.patch,
    oldText: '',
    newText: '',
  };
}

function createViewer(args: ViewerStoryArgs): DiffViewerElement {
  const viewer = document.createElement('wc-diff-viewer') as DiffViewerElement;
  viewer.setAttribute('data-theme', args.theme);
  viewer.setAttribute('title', args.title);
  viewer.setAttribute('old-label', args.oldLabel);
  viewer.setAttribute('new-label', args.newLabel);
  viewer.language = args.language;
  viewer.view = args.view;
  viewer.wrap = args.wrap;
  if (args.diffText) {
    viewer.diffText = args.diffText;
  } else {
    viewer.diffText = '';
    viewer.oldText = args.oldText;
    viewer.newText = args.newText;
  }
  return viewer;
}

function createSurface(theme: Theme, className = 'showcase-surface'): HTMLElement {
  const surface = document.createElement('section');
  surface.className = className;
  surface.dataset.theme = theme;
  return surface;
}

function createViewerFrame(viewer: DiffViewerElement): HTMLElement {
  const frame = document.createElement('div');
  frame.className = 'viewer-frame';
  frame.append(viewer);
  return frame;
}

function renderViewer(args: ViewerStoryArgs): HTMLElement {
  const surface = createSurface(args.theme);
  const header = document.createElement('header');
  header.className = 'story-header';

  const copy = document.createElement('div');
  copy.className = 'story-copy';
  const kicker = document.createElement('p');
  kicker.className = 'story-kicker';
  kicker.textContent = 'GitHub parity fixture';
  const heading = document.createElement('h1');
  heading.className = 'story-title';
  heading.textContent = args.storyTitle;
  const note = document.createElement('p');
  note.className = 'story-note';
  note.textContent = args.note;
  copy.append(kicker, heading, note);

  if (args.sourceUrl) {
    const link = document.createElement('a');
    link.className = 'story-source';
    link.href = args.sourceUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = args.sourceLabel ?? 'Open source PR';
    header.append(copy, link);
  } else {
    header.append(copy);
  }

  surface.append(header, createViewerFrame(createViewer(args)));
  return surface;
}

function renderBareViewer(args: ViewerStoryArgs): HTMLElement {
  const surface = createSurface(args.theme, 'showcase-surface bare-surface');
  surface.append(createViewerFrame(createViewer(args)));
  return surface;
}

function renderSlotViewer(args: ViewerStoryArgs): HTMLElement {
  const surface = createSurface(args.theme, 'showcase-surface');
  const viewer = createViewer(args);

  const contextHeader = document.createElement('header');
  contextHeader.slot = 'header';
  contextHeader.className = 'slot-context';
  const contextCopy = document.createElement('div');
  contextCopy.className = 'slot-context-copy';
  const kicker = document.createElement('p');
  kicker.className = 'slot-context-kicker';
  kicker.textContent = 'Optional host context';
  const heading = document.createElement('h1');
  heading.className = 'slot-context-title';
  heading.textContent = args.storyTitle;
  const note = document.createElement('p');
  note.className = 'slot-context-note';
  note.textContent = args.note;
  contextCopy.append(kicker, heading, note);
  contextHeader.append(contextCopy);

  if (args.sourceUrl) {
    const link = document.createElement('a');
    link.className = 'slot-context-link';
    link.href = args.sourceUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = args.sourceLabel ?? 'Open source';
    contextHeader.append(link);
  }

  const toolbarLink = document.createElement('a');
  toolbarLink.slot = 'toolbar';
  toolbarLink.className = 'slot-toolbar-link';
  toolbarLink.href = args.sourceUrl ?? 'https://github.com/pankaj28843/web-components';
  toolbarLink.target = '_blank';
  toolbarLink.rel = 'noreferrer';
  toolbarLink.textContent = 'Open linked context';

  const footer = document.createElement('p');
  footer.slot = 'footer';
  footer.className = 'slot-footer-note';
  footer.textContent = 'Footer context is projected by the host and remains optional.';

  viewer.append(contextHeader, toolbarLink, footer);
  surface.append(createViewerFrame(viewer));
  return surface;
}

const meta = {
  title: 'Components/Diff viewer',
  component: 'wc-diff-viewer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A native custom element for standard unified diffs or text comparisons. Optional named slots let a host provide its own heading, links, actions, and footer context.',
      },
    },
  },
  argTypes: {
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    view: { control: 'inline-radio', options: ['unified', 'split'] },
    wrap: { control: 'boolean' },
    language: {
      control: 'select',
      options: ['auto', 'javascript', 'typescript', 'go', 'cpp', 'json', 'plaintext'],
    },
    diffText: { control: 'text' },
    oldText: { control: 'text' },
    newText: { control: 'text' },
    storyTitle: { control: false },
    note: { control: false },
    sourceUrl: { control: false },
    sourceLabel: { control: false },
    title: { control: 'text' },
    oldLabel: { control: 'text' },
    newLabel: { control: 'text' },
  },
  render: renderViewer,
} satisfies Meta<ViewerStoryArgs>;

export default meta;
type Story = StoryObj<ViewerStoryArgs>;

export const Unified: Story = {
  name: 'Unified · multi-file review',
  args: createFixtureArgs(pullRequestFixtures.react),
};

export const Bare: Story = {
  name: 'Default · context-free',
  render: renderBareViewer,
  args: createFixtureArgs(pullRequestFixtures.react),
};

export const ContextSlots: Story = {
  name: 'Composition · optional slots',
  render: renderSlotViewer,
  args: {
    ...createFixtureArgs(pullRequestFixtures.typescript),
    storyTitle: 'Build configuration diff',
    note: 'The viewer renders the diff; the host supplies this heading, tagline, source link, action, and footer through optional named slots.',
  },
};

export const Split: Story = {
  name: 'Split · paired lines',
  args: {
    ...createFixtureArgs(pullRequestFixtures.typescript),
    view: 'split',
  },
};

export const ThemeDark: Story = {
  name: 'Theme · dark',
  args: createFixtureArgs(pullRequestFixtures.node, 'dark'),
};

export const ThemeLight: Story = {
  name: 'Theme · light',
  args: createFixtureArgs(pullRequestFixtures.angular, 'light'),
};

export const Responsive: Story = {
  name: 'Responsive · narrow fallback',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    ...createFixtureArgs(pullRequestFixtures.kubernetes),
    view: 'split',
    wrap: true,
  },
};

export const InteractionStates: Story = {
  name: 'Interaction · search, wrap, copy',
  args: {
    ...createFixtureArgs(pullRequestFixtures.golang),
    wrap: true,
  },
};

export const ReactPR36944: Story = {
  name: 'PR · React #36944',
  args: createFixtureArgs(pullRequestFixtures.react),
};

export const TypeScriptPR40336: Story = {
  name: 'PR · TypeScript #40336',
  args: createFixtureArgs(pullRequestFixtures.typescript),
};

export const KubernetesPR137050: Story = {
  name: 'PR · Kubernetes #137050',
  args: createFixtureArgs(pullRequestFixtures.kubernetes),
};

export const GoPR79774: Story = {
  name: 'PR · Go #79774',
  args: createFixtureArgs(pullRequestFixtures.golang),
};

export const NodePR62241: Story = {
  name: 'PR · Node.js #62241',
  args: createFixtureArgs(pullRequestFixtures.node),
};

export const AngularPR69860: Story = {
  name: 'PR · Angular #69860',
  args: createFixtureArgs(pullRequestFixtures.angular),
};

export const TextComparison: Story = {
  name: 'State · text comparison',
  args: {
    storyTitle: 'Text comparison',
    note: 'The same component also accepts oldText and newText when a unified patch is not available.',
    theme: 'light',
    view: 'unified',
    wrap: false,
    language: 'typescript',
    title: 'Generated API response',
    oldLabel: 'Before',
    newLabel: 'After',
    diffText: '',
    oldText: 'export const endpoint = "/v1/items";\nexport const timeout = 3000;\n',
    newText: 'export const endpoint = "/v2/items";\nexport const timeout = 5000;\nexport const cache = true;\n',
  },
};

export const ParserEdgeStates: Story = {
  name: 'State · invalid patch',
  args: {
    storyTitle: 'Parser edge state',
    note: 'Invalid and metadata-only patches stay visible as actionable states instead of disappearing from the review surface.',
    theme: 'dark',
    view: 'unified',
    wrap: false,
    language: 'plaintext',
    title: 'Malformed patch',
    oldLabel: 'Base',
    newLabel: 'Changed',
    diffText: 'this is not a unified diff',
    oldText: '',
    newText: '',
  },
};
