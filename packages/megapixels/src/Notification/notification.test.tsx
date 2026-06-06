import { afterEach, describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { act } from '@testing-library/react';

import { modal } from '@fuf-stack/pixels/Modal';

import * as stories from './notification.stories';

// The notification stories open modals via the global modal store, which
// renders into a document.body portal. Hard-reset the store after each test —
// while the React tree is still mounted — so the portal unmounts cleanly.
// Otherwise the next test's body wipe (vitest.setup.ts) races with the modal
// teardown and surfaces async errors ("node to be removed is not a child",
// "setPointerCapture is not a function") against the wrong test.
afterEach(() => {
  act(() => {
    modal.reset();
  });
});

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
