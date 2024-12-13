/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */

// see: https://storybook.js.org/docs/writing-tests/snapshot-testing#execute-tests-on-multiple-stories

/* eslint-disable import/no-extraneous-dependencies */
import type { Meta, StoryFn } from '@storybook/react';

import { expect, test } from 'vitest';

import { composeStories } from '@storybook/react';

// Make StoryFile generic to accept component props
type StoryFile<TProps = any> = {
  default: Meta<TProps>;
  [name: string]: StoryFn<TProps> | Meta<TProps>;
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

export default <TProps extends Record<string, any>>(
  storyFile: StoryFile<TProps>,
) => {
  const stories = Object.entries(compose(storyFile)).map(([name, story]) => ({
    name,
    story,
  }));

  if (stories.length <= 0) {
    throw new Error(
      `No stories found for this module: ${storyFile.default.title}. Make sure there is at least one valid story for this module.`,
    );
  }

  stories.forEach(({ name, story }) => {
    test(name, async () => {
      await story.run();
      // Ensures a consistent snapshot by waiting for the component to render by adding a delay of 1 ms before taking the snapshot.
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(document.body?.firstChild).toMatchSnapshot();
    });
  });
};
