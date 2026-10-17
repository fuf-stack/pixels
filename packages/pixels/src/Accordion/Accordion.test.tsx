import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render } from '@testing-library/react';

import Accordion from './Accordion';
import * as stories from './stories/Accordion.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Coverage', () => {
  test('should render with undefined className', () => {
    const { container } = render(
      <Accordion accordionItems={[]} className={undefined} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
