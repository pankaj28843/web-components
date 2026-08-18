import { defineMain } from '@storybook/web-components-vite/node';

export default defineMain({
  stories: ['../stories/**/*.stories.ts'],
  addons: [],
  framework: '@storybook/web-components-vite',
  viteFinal: async (config) => ({
    ...config,
    base: '/web-components/',
  }),
});
