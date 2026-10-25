import type { VisualOptions } from './types';

import { readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import captureStory from './capture';

interface IndexedStory {
  id: string;
  importPath: string;
  tags: string[];
  type: string;
}

const configDirectory = fileURLToPath(new URL('../', import.meta.url));
const packagesDirectory = resolve(configDirectory, '../..');
const index = JSON.parse(
  readFileSync(
    new URL('../storybook-static/index.json', import.meta.url),
    'utf8',
  ),
) as {
  entries: Record<string, IndexedStory>;
};
const stories = Object.values(index.entries).filter(
  (story) => story.type === 'story' && story.tags.includes('visual'),
);

if (!stories.length) {
  throw new Error(
    'No visual stories found, rebuild with pnpm --filter @repo/storybook-config storybook:build',
  );
}

for (const story of stories) {
  test(story.id, async ({ page }, testInfo) => {
    // observe settings and completion before the embedded Storybook loads
    await page.addInitScript(() => {
      window.addEventListener('message', ({ data }) => {
        let message = data;
        if (typeof message === 'string') {
          try {
            message = JSON.parse(message);
          } catch {
            return;
          }
        }
        if (message?.type === 'visual:prepare') {
          Object.assign(window, {
            visualOptions: message.options,
            visualPrepared: true,
          });
        }
        if (message?.event?.type === 'storyFinished') {
          Object.assign(window, { visualResult: message.event.args[0] });
        }
      });
    });

    await page.goto(
      `/visual.html?id=${story.id}&theme=${testInfo.project.name}`,
    );
    await expect
      .poll(async () =>
        page.evaluate(
          () => Reflect.get(window, 'visualPrepared') as boolean | undefined,
        ),
      )
      .toBe(true);

    const options = await page.evaluate(
      () => Reflect.get(window, 'visualOptions') as VisualOptions | undefined,
    );
    if (
      !options ||
      (options.capture !== 'viewport' && !options.target) ||
      (options.capture === 'viewport' && options.target)
    ) {
      throw new Error(
        `${story.id} needs parameters.visual.target or capture: 'viewport'`,
      );
    }
    if (options.viewport) {
      const { width, height } = options.viewport;
      if (
        !Number.isInteger(width) ||
        width <= 0 ||
        !Number.isInteger(height) ||
        height <= 0
      ) {
        throw new Error(`${story.id} needs a positive integer visual viewport`);
      }
      await page.setViewportSize(options.viewport);
    }

    // release the loader only after the story's viewport has been applied
    await page.locator('#visual-story').evaluate((element) => {
      (element as HTMLIFrameElement).contentWindow?.postMessage(
        { type: 'visual:ready' },
        window.location.origin,
      );
    });
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            Reflect.get(window, 'visualResult') as
              { storyId: string; status: string } | undefined,
        ),
      )
      .toMatchObject({ storyId: story.id, status: 'success' });
    await page
      .frameLocator('#visual-story')
      .locator('html')
      .evaluate(async () => {
        await document.fonts.ready;
      });

    // use the source story folder to keep baselines with its owning component
    const storyFolder = dirname(resolve(configDirectory, story.importPath));
    if (basename(storyFolder) !== 'stories') {
      throw new Error(
        `${story.id} must live in its component's stories folder`,
      );
    }
    const owner = relative(packagesDirectory, dirname(storyFolder));
    if (owner.startsWith('..')) {
      throw new Error(
        `Visual story is outside workspace packages: ${story.importPath}`,
      );
    }
    const [, storyName] = story.id.split('--');
    const filename = `${storyName}.png`;
    const snapshot = [
      ...owner.split('/'),
      '__snapshots__',
      'visual',
      testInfo.project.name,
      filename,
    ];

    await captureStory(page, options, snapshot);
  });
}
