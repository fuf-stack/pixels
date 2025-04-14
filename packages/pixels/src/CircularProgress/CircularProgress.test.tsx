import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render } from '@testing-library/react';

import CircularProgress from './CircularProgress';
import * as stories from './CircularProgress.stories';

describe('<ProgressCircular /> spec', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<CircularProgress percent={42} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('property className', () => {
    render(<CircularProgress className="test1 test2 test3" percent={42} />);
    expect(document.querySelector('.test1')).toBeInTheDocument();
    expect(document.querySelector('.test2')).toBeInTheDocument();
    expect(document.querySelector('.test3')).toBeInTheDocument();
  });
});

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
