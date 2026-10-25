import type { Page } from '@playwright/test';
import type { VisualOptions } from './types';

import { expect } from '@playwright/test';

/** Captures selected story content with padding, or the complete viewport */
const captureStory = async (
  page: Page,
  options: VisualOptions,
  snapshot: string[],
) => {
  await page.mouse.move(0, 0);

  if (options.capture === 'viewport') {
    await expect(page).toHaveScreenshot(snapshot);
    return;
  }

  const elements = page.frameLocator('#visual-story').locator(options.target);
  // union every selected element, including menus rendered in portals
  const matches = await elements.all();
  expect(
    matches.length,
    'The visual target must contain rendered elements',
  ).toBeGreaterThan(0);
  const boxes = await Promise.all(
    matches.map(async (element) => {
      await expect(element).toBeVisible();
      return element.boundingBox();
    }),
  );
  const bounds = boxes.filter((box) => {
    return box !== null;
  });
  expect(bounds).toHaveLength(matches.length);

  // preserve focus rings and shadows, clipping overflow at the real viewport
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Visual captures require a fixed viewport');
  }
  const padding = 16;
  const edges = bounds.reduce(
    (region, box) => {
      return {
        left: Math.min(region.left, box.x),
        top: Math.min(region.top, box.y),
        right: Math.max(region.right, box.x + box.width),
        bottom: Math.max(region.bottom, box.y + box.height),
      };
    },
    { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
  );

  const x = Math.max(0, Math.floor(edges.left - padding));
  const y = Math.max(0, Math.floor(edges.top - padding));
  const right = Math.min(viewport.width, Math.ceil(edges.right + padding));
  const bottom = Math.min(viewport.height, Math.ceil(edges.bottom + padding));

  await expect(page).toHaveScreenshot(snapshot, {
    clip: { x, y, width: right - x, height: bottom - y },
  });
};

export default captureStory;
