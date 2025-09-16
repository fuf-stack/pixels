import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render } from '@testing-library/react';

import Card from './Card';
import * as stories from './Card.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Coverage', () => {
  test('should render with no children', () => {
    const { container } = render(<Card />);
    expect(container.firstChild).toMatchSnapshot();
  });
  test('Should have correct testIds', () => {
    const { container } = render(<Card testId="card1" />);
    expect(container.firstChild).toMatchSnapshot();
  });
  test('should render with only header', () => {
    const { container } = render(
      <Card footer="id" header={<div>test</div>} testId="testId" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
