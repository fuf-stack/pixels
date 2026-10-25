import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import * as stories from './stories/SubmitButton.stories';
import SubmitButton from './SubmitButton';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Component markers', () => {
  it('identifies the composed button by its public owner', () => {
    render(<SubmitButton ariaLabel="Save" />);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'data-component',
      'submit-button',
    );
  });
});
