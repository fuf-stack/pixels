import { describe, expect, test } from 'vitest';

import { createRef } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render } from '@testing-library/react';

import ScrollShadow from './ScrollShadow';
import * as edgeCaseStories from './stories/ScrollShadow.edge-cases.stories';
import * as interactionStories from './stories/ScrollShadow.interactions.stories';
import * as stories from './stories/ScrollShadow.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
  storySnapshots(edgeCaseStories);
});

describe('Coverage', () => {
  test('renders ScrollShadow component without children and className', () => {
    const { container } = render(<ScrollShadow />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DOM contract', () => {
  test('forwards the native ref, slot and inline style overrides', () => {
    const ref = createRef<HTMLDivElement>();
    const { getByTestId } = render(
      <ScrollShadow
        ref={ref}
        dataSlot="body"
        size={24}
        style={{ maxHeight: 180 }}
        testId="scroll"
      >
        Content
      </ScrollShadow>,
    );
    expect(ref.current).toBe(getByTestId('scroll'));
    expect(ref.current).toHaveAttribute('data-slot', 'body');
    expect(ref.current?.style.getPropertyValue('--scroll-shadow-size')).toBe(
      '24px',
    );
    expect(ref.current).toHaveStyle({ maxHeight: '180px' });
  });
});
