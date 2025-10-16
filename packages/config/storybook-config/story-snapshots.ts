/* eslint-disable @typescript-eslint/no-explicit-any */

// see: https://storybook.js.org/docs/writing-tests/snapshot-testing#execute-tests-on-multiple-stories

/* eslint-disable import-x/no-extraneous-dependencies */
import type { Meta, StoryFn } from '@storybook/react-vite';

import { expect, test } from 'vitest';

import { composeStories } from '@storybook/react-vite';

// Make StoryFile generic to accept component props
interface StoryFile<TProps = any> {
  default: Meta<TProps>;
  [name: string]: StoryFn<TProps> | Meta<TProps>;
}

// Ensure reduced motion for deterministic snapshots (disable animations)
const ensurePrefersReducedMotion = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const mockMatchMedia = (query: string) => {
    const isReduced =
      query.includes('prefers-reduced-motion') && query.includes('reduce');
    return {
      matches: isReduced,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {
        return false;
      },
    } as unknown as MediaQueryList;
  };

  (window as any).matchMedia = mockMatchMedia;
};

const compose = (
  entry: StoryFile,
): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(entry)}, ${e}`,
    );
  }
};

const storySnapshots = <TProps extends Record<string, any>>(
  storyFile: StoryFile<TProps>,
) => {
  ensurePrefersReducedMotion();
  const stories = Object.entries(compose(storyFile)).map(([name, story]) => {
    return {
      name,
      story,
    };
  });

  if (stories.length <= 0) {
    throw new Error(
      `No stories found for this module: ${storyFile.default.title}. Make sure there is at least one valid story for this module.`,
    );
  }

  stories.forEach(({ name, story }) => {
    test(name, async () => {
      await story.run();
      // Ensures a consistent snapshot by waiting for the component to render by adding a delay of 1 ms before taking the snapshot.
      await new Promise((resolve) => {
        setTimeout(resolve, 1);
      });
      expect(document.body?.firstChild).toMatchSnapshot();
    });
  });
};

export default storySnapshots;
