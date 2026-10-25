/* eslint-disable import-x/no-extraneous-dependencies */

import type { Preview } from '@storybook/react-vite';

import { themes } from 'storybook/theming';

import visualLoader from './visual/loader';

const preview: Preview = {
  loaders: [visualLoader],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    // show also description and default in controls panel
    controls: { expanded: true },
    // configure dark mode
    // see: https://github.com/vuelessjs/storybook-dark-mode
    darkMode: {
      classTarget: 'html',
      current: 'dark',
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true,
      dark: {
        ...themes.dark,
        appBg: '#161616',
        barBg: 'black',
        background: 'black',
        appContentBg: 'black',
        appBorderRadius: 14,
      },
      light: {
        ...themes.light,
        appBorderRadius: 14,
      },
    },
    layout: 'centered',
  },

  // 👇 Enables auto-generated documentation for all stories
  // see: https://storybook.js.org/docs/writing-docs/autodocs#set-up-automated-documentation
  tags: ['autodocs'],
};

export default preview;

export type { Preview };
