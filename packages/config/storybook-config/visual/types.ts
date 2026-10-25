import type { ViewportSize } from '@playwright/test';

/** Selects the area and rendering viewport for a tagged visual story */
export type VisualOptions = {
  /** Sets the browser viewport before the story renders */
  viewport?: ViewportSize;
} & (
  | {
      /** Captures the viewport, including overlay backdrops and placement */
      capture: 'viewport';
      target?: never;
    }
  | {
      capture?: never;
      /** Selects rendered elements to capture, including any portaled content */
      target: string;
    }
);
