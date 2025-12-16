/* eslint-disable @typescript-eslint/no-explicit-any */

// see: https://storybook.js.org/docs/writing-tests/snapshot-testing#execute-tests-on-multiple-stories

/* eslint-disable import-x/no-extraneous-dependencies */
import type { Meta, StoryFn } from '@storybook/react-vite';

import { expect, test } from 'vitest';

import { composeStories } from '@storybook/react-vite';

// Custom snapshot serializer to normalize React Aria IDs
// Handles both old format (e.g., «r1», «r1a») and new format after React 19 (e.g., _r_1a_, _r_1k_)
expect.addSnapshotSerializer({
  serialize(val: string, config, indentation, depth, refs, printer) {
    // Replace old React Aria ID format: «\w+» with '«replaced-aria-id»'
    let normalized = val.replace(/«\w+»/g, '«replaced-aria-id»');
    // Replace new React Aria ID format (React 19+): _r_[alphanumeric]+_ with '«replaced-aria-id»'
    normalized = normalized.replace(/_r_[a-zA-Z0-9]+_/g, '«replaced-aria-id»');
    return printer(normalized, config, indentation, depth, refs);
  },
  test(val: any) {
    // Test for both old and new formats
    return (
      typeof val === 'string' &&
      (/«\w+»/.test(val) || /_r_[a-zA-Z0-9]+_/.test(val))
    );
  },
});

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
      // Ensures a consistent snapshot by waiting for the component to render
      // Small delay allows third-party component hooks (like HeroUI's use-is-mounted) to complete
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      // If there's only one child, snapshot it directly (cleaner snapshots)
      // If there are multiple children (e.g. live announcer + content), snapshot body
      const snapshotTarget =
        document.body.children.length === 1
          ? document.body.firstChild
          : document.body;
      expect(snapshotTarget).toMatchSnapshot();
    });
  });
};

export default storySnapshots;
