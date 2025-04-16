import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render } from '@testing-library/react';

import ProgressCircular from './ProgressCircular';
import * as stories from './ProgressCircular.stories';

describe('<ProgressCircular /> spec', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<ProgressCircular percent={42} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('property className', () => {
    render(<ProgressCircular className="test1 test2 test3" percent={42} />);
    expect(document.querySelector('.test1')).toBeInTheDocument();
    expect(document.querySelector('.test2')).toBeInTheDocument();
    expect(document.querySelector('.test3')).toBeInTheDocument();
  });
});

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
