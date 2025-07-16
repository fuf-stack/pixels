/* eslint-disable import/no-extraneous-dependencies */

import '@repo/tailwind-config/tailwind.css';

import type { Decorator, Preview } from '@storybook/react-vite';

import { useEffect } from 'react';

import { DARK_MODE_EVENT_NAME, useDarkMode } from '@vueless/storybook-dark-mode';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

// see: https://github.com/hipstersmoothie/storybook-dark-mode/issues/168
const DarkModeHtmlAttributeDecorator: Decorator = (Story) => {
  const isDarkMode = useDarkMode();
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);
  return <Story />;
};

// see: https://github.com/storybookjs/test-runner/issues/74#issuecomment-1165389157
const DisableTestRunnerDecorator: Decorator = (Story, { parameters }) => {
  if (
    parameters.testRunner?.disable === true &&
    navigator.userAgent.includes('StorybookTestRunner')
  ) {
    return <>Disabled for Test Runner</>;
  }
  return <Story />;
};

// see: https://storybook.js.org/docs/essentials/backgrounds#configuration
const backgroundOptions =  {
  lightgray: { name: 'lightgray', value: '#f5f7fa' },
  white: { name: 'white', value: '#ffffff' },
  dark: { name: 'dark', value: '#333333' },
};

const preview: Preview = {
  decorators: [DarkModeHtmlAttributeDecorator, DisableTestRunnerDecorator],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      options: backgroundOptions,
    },
    // show also description and default in controls panel
    controls: { expanded: true },
    // configure dark mode
    // see: https://storybook.js.org/addons/storybook-dark-mode
    darkMode: {
      // Set the initial theme to light
      current: 'light',
      stylePreview: true,
      darkClass: 'dark',
      lightClass: 'light',
    },
    layout: 'centered',
  },

  // 👇 Enables auto-generated documentation for all stories
  // see: https://storybook.js.org/docs/writing-docs/autodocs#set-up-automated-documentation
  tags: ['autodocs'],
};

// change background when dark mode is toggled
// see: https://www.bekk.christmas/post/2021/3/storybook-background-change-on-prop-change
const channel = addons.getChannel();

let previousIsDarkMode = false;

const darkModeToggleListener = (isDarkMode: boolean) => {
  if (previousIsDarkMode !== isDarkMode) {
    console.log('dark mode changed, setting background...', {
      isDarkMode,
    });
    previousIsDarkMode = isDarkMode;
    channel.emit(UPDATE_GLOBALS, {
      globals: {
        backgrounds: { value: isDarkMode ? 'dark' : 'lightgray' },
      },
    });
  }
};

channel.addListener(DARK_MODE_EVENT_NAME, darkModeToggleListener);

export default preview;

export type { Preview };
