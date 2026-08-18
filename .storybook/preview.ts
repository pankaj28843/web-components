import type { Preview } from '@storybook/web-components-vite';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Showcase theme',
      defaultValue: 'story',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'story', title: 'Story default' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const rendered = Story();
      if (!(rendered instanceof HTMLElement)) {
        return rendered;
      }

      const globalTheme = context.globals.theme as 'story' | 'light' | 'dark' | undefined;
      const storyTheme = context.args.theme as 'light' | 'dark' | undefined;
      const theme = globalTheme === 'story' || globalTheme === undefined ? storyTheme : globalTheme;

      if (theme) {
        rendered.dataset.theme = theme;
        rendered.querySelector('wc-diff-viewer')?.setAttribute('data-theme', theme);
      }

      return rendered;
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;
